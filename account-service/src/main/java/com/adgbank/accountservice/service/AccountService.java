package com.adgbank.accountservice.service;

import com.adgbank.accountservice.entity.AccountEntity;
import com.adgbank.accountservice.exception.AccountNotFoundException;
import com.adgbank.accountservice.exception.InsufficientFundsException;
import com.adgbank.accountservice.repository.AccountRepository;
import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateAccountRequest;
import com.adgbank.common.dto.UpdateBalanceRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;
    private final SecureRandom random = new SecureRandom();

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
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
        String accountNumber = generateUniqueAccountNumber(request.currency());
        BigDecimal initialBalance = request.initialDeposit() != null
                ? request.initialDeposit().setScale(2, RoundingMode.HALF_EVEN)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);

        AccountEntity entity = new AccountEntity(
                request.userId(),
                accountNumber,
                initialBalance,
                request.currency().toUpperCase(),
                "ACTIVE"
        );

        AccountEntity saved = accountRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public AccountDto updateBalance(Long id, UpdateBalanceRequest request) {
        AccountEntity account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new IllegalStateException("Account " + account.getAccountNumber() + " is not active (status: " + account.getStatus() + ")");
        }

        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_EVEN);
        BigDecimal currentBalance = account.getBalance();

        if ("DEBIT".equalsIgnoreCase(request.operationType())) {
            if (currentBalance.compareTo(amount) < 0) {
                throw new InsufficientFundsException(String.format(
                        "Insufficient funds on account %s. Current balance: %s, required: %s",
                        account.getAccountNumber(), currentBalance, amount
                ));
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
        String currencyCode = "RUB".equalsIgnoreCase(currency) ? "810" : ("USD".equalsIgnoreCase(currency) ? "840" : "978");
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
                entity.getCreatedAt()
        );
    }
}

