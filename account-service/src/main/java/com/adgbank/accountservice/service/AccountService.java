package com.adgbank.accountservice.service;

import com.adgbank.accountservice.client.PqcVaultClient;
import com.adgbank.accountservice.entity.AccountEntity;
import com.adgbank.accountservice.exception.AccountNotFoundException;
import com.adgbank.accountservice.exception.InsufficientFundsException;
import com.adgbank.accountservice.exception.InvalidQuantumSignatureException;
import com.adgbank.accountservice.repository.AccountRepository;
import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateAccountRequest;
import com.adgbank.common.dto.PqcGenerateKeyRequest;
import com.adgbank.common.dto.PqcKeyResponse;
import com.adgbank.common.dto.PqcVerifyRequest;
import com.adgbank.common.dto.PqcVerifyResponse;
import com.adgbank.common.dto.UpdateBalanceRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final AccountRepository accountRepository;
    private final PqcVaultClient pqcVaultClient;
    private final SecureRandom random = new SecureRandom();

    public AccountService(AccountRepository accountRepository, PqcVaultClient pqcVaultClient) {
        this.accountRepository = accountRepository;
        this.pqcVaultClient = pqcVaultClient;
    }

    public List<AccountDto> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public AccountDto getAccountById(Long id) {
        return accountRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
    }

    public List<AccountDto> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    public AccountDto getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(this::toDto)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));
    }

    @Transactional
    public AccountDto createAccount(CreateAccountRequest request) {
        String currency = request.currency().toUpperCase();
        String accountNumber = generateUniqueAccountNumber(currency);
        BigDecimal initialBalance = AccountEntity.scaleAmount(request.initialDeposit(), currency);

        String pqcKeyId = null;
        try {
            if (pqcVaultClient != null) {
                log.info("Requesting post-quantum CRYSTALS-Dilithium3 keypair for account {}", accountNumber);
                PqcKeyResponse keyResponse = pqcVaultClient.generateKey(new PqcGenerateKeyRequest(accountNumber));
                if (keyResponse != null && keyResponse.keyId() != null) {
                    pqcKeyId = keyResponse.keyId().toString();
                    log.info("PQC Key generated successfully with keyId: {}", pqcKeyId);
                }
            }
        } catch (Exception ex) {
            log.warn("Could not generate PQC keypair via pqc-vault-service ({}: {}). Account will be created without vault binding.",
                    ex.getClass().getSimpleName(), ex.getMessage());
        }

        AccountEntity entity = new AccountEntity(
                request.userId(),
                accountNumber,
                initialBalance,
                currency,
                "ACTIVE",
                pqcKeyId
        );

        AccountEntity saved = accountRepository.save(entity);
        log.info("Bank account created: id={}, number={}, currency={}, pqcKeyId={}",
                saved.getId(), saved.getAccountNumber(), saved.getCurrency(), saved.getPqcKeyId());
        return toDto(saved);
    }

    @Transactional
    public AccountDto updateBalance(Long id, UpdateBalanceRequest request) {
        AccountEntity account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new IllegalStateException("Account " + account.getAccountNumber() + " is not active (status: " + account.getStatus() + ")");
        }

        BigDecimal amount = AccountEntity.scaleAmount(request.amount(), account.getCurrency());
        BigDecimal currentBalance = account.getBalance();

        if ("DEBIT".equalsIgnoreCase(request.operationType())) {
            if (currentBalance.compareTo(amount) < 0) {
                throw new InsufficientFundsException(String.format(
                        "Insufficient funds on account %s. Current balance: %s, required: %s",
                        account.getAccountNumber(), currentBalance, amount
                ));
            }

            // Verify PQC signature if account is quantum-secured and signature is supplied
            if (account.getPqcKeyId() != null && request.pqcSignature() != null && !request.pqcSignature().isBlank()) {
                String payloadToVerify = request.canonicalPayload() != null && !request.canonicalPayload().isBlank()
                        ? request.canonicalPayload()
                        : (request.referenceId() != null ? request.referenceId() : account.getAccountNumber() + ":" + amount);

                try {
                    log.info("Verifying post-quantum Dilithium3 signature for account {} (keyId={})",
                            account.getAccountNumber(), account.getPqcKeyId());
                    PqcVerifyResponse verifyResponse = pqcVaultClient.verify(new PqcVerifyRequest(
                            UUID.fromString(account.getPqcKeyId()),
                            null,
                            payloadToVerify,
                            request.pqcSignature()
                    ));

                    if (verifyResponse == null || !verifyResponse.valid()) {
                        String msg = verifyResponse != null ? verifyResponse.message() : "Verification service returned null";
                        log.error("PQC signature verification failed for account {}: {}", account.getAccountNumber(), msg);
                        throw new InvalidQuantumSignatureException("PQC signature verification rejected: " + msg);
                    }
                    log.info("PQC signature verified successfully for DEBIT on account {}", account.getAccountNumber());
                } catch (InvalidQuantumSignatureException ex) {
                    throw ex;
                } catch (Exception ex) {
                    log.error("Error communicating with pqc-vault-service during verification: {}", ex.getMessage(), ex);
                    throw new InvalidQuantumSignatureException("Failed to verify quantum signature: " + ex.getMessage());
                }
            }

            account.setBalance(currentBalance.subtract(amount));
        } else if ("CREDIT".equalsIgnoreCase(request.operationType())) {
            account.setBalance(currentBalance.add(amount));
        } else {
            throw new IllegalArgumentException("Unsupported operation type: " + request.operationType());
        }

        AccountEntity updated = accountRepository.save(account);
        return toDto(updated);
    }

    private String generateUniqueAccountNumber(String currency) {
        String prefix = "40817";
        String currencyCode;
        if ("RUB".equalsIgnoreCase(currency)) {
            currencyCode = "810";
        } else if ("USD".equalsIgnoreCase(currency)) {
            currencyCode = "840";
        } else if ("EUR".equalsIgnoreCase(currency)) {
            currencyCode = "978";
        } else if ("BTC".equalsIgnoreCase(currency)) {
            currencyCode = "001";
        } else if ("USDT".equalsIgnoreCase(currency)) {
            currencyCode = "002";
        } else {
            currencyCode = "999";
        }

        String accountNumber;
        do {
            long suffix = 1000000000L + (Math.abs(random.nextLong()) % 9000000000L);
            accountNumber = prefix + currencyCode + suffix;
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    private AccountDto toDto(AccountEntity entity) {
        return new AccountDto(
                entity.getId(),
                entity.getUserId(),
                entity.getAccountNumber(),
                entity.getBalance(),
                entity.getCurrency(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getPqcKeyId()
        );
    }
}
