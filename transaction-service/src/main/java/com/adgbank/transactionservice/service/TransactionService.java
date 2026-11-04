package com.adgbank.transactionservice.service;

import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateTransactionRequest;
import com.adgbank.common.dto.MarketConversionResponse;
import com.adgbank.common.dto.PqcSignRequest;
import com.adgbank.common.dto.PqcSignResponse;
import com.adgbank.common.dto.TransactionDto;
import com.adgbank.common.dto.UpdateBalanceRequest;
import com.adgbank.transactionservice.client.AccountClient;
import com.adgbank.transactionservice.client.MarketRateClient;
import com.adgbank.transactionservice.client.PqcVaultClient;
import com.adgbank.transactionservice.entity.TransactionEntity;
import com.adgbank.transactionservice.exception.TransactionNotFoundException;
import com.adgbank.transactionservice.exception.TransferExecutionException;
import com.adgbank.transactionservice.repository.TransactionRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final AccountClient accountClient;
    private final MarketRateClient marketRateClient;
    private final PqcVaultClient pqcVaultClient;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountClient accountClient,
                              MarketRateClient marketRateClient,
                              PqcVaultClient pqcVaultClient) {
        this.transactionRepository = transactionRepository;
        this.accountClient = accountClient;
        this.marketRateClient = marketRateClient;
        this.pqcVaultClient = pqcVaultClient;
    }

    public List<TransactionDto> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public TransactionDto getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with id: " + id));
    }

    public List<TransactionDto> getTransactionsByAccount(Long accountId) {
        return transactionRepository.findBySourceAccountIdOrTargetAccountIdOrderByCreatedAtDesc(accountId, accountId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    @CircuitBreaker(name = "accountServiceCircuitBreaker", fallbackMethod = "executeTransferFallback")
    public TransactionDto executeTransfer(CreateTransactionRequest request, String idempotencyKey) {
        if (Objects.equals(request.sourceAccountId(), request.targetAccountId())) {
            throw new IllegalArgumentException("Source and target accounts must be different");
        }

        String effectiveIdempotencyKey = (idempotencyKey != null && !idempotencyKey.isBlank())
                ? idempotencyKey
                : UUID.randomUUID().toString();

        Optional<TransactionEntity> existing = transactionRepository.findByIdempotencyKey(effectiveIdempotencyKey);
        if (existing.isPresent()) {
            log.info("Idempotent request detected for key {}. Returning existing transaction id {}",
                    effectiveIdempotencyKey, existing.get().getId());
            return toDto(existing.get());
        }

        // 1. Verify existence of both accounts via account-service
        AccountDto sourceAccount = accountClient.getAccountById(request.sourceAccountId());
        AccountDto targetAccount = accountClient.getAccountById(request.targetAccountId());

        if (sourceAccount == null || targetAccount == null) {
            throw new TransferExecutionException("One or both accounts could not be retrieved from account-service");
        }

        BigDecimal transferAmount = TransactionEntity.scaleAmount(request.amount(), sourceAccount.currency());

        // 2. Multi-currency calculation
        BigDecimal targetAmount;
        BigDecimal exchangeRate;

        if (sourceAccount.currency().equalsIgnoreCase(targetAccount.currency())) {
            targetAmount = transferAmount;
            exchangeRate = BigDecimal.ONE;
        } else {
            log.info("Multi-currency transfer requested from {} to {}", sourceAccount.currency(), targetAccount.currency());
            try {
                MarketConversionResponse conversion = marketRateClient.convert(
                        sourceAccount.currency(),
                        targetAccount.currency(),
                        transferAmount
                );
                targetAmount = conversion.convertedAmount();
                exchangeRate = conversion.rate();
                log.info("Currency converted: {} {} -> {} {} (rate: {})",
                        transferAmount, sourceAccount.currency(), targetAmount, targetAccount.currency(), exchangeRate);
            } catch (Exception ex) {
                log.error("Failed to fetch exchange rate from market-rate-service: {}", ex.getMessage(), ex);
                throw new TransferExecutionException("Currency conversion failed: " + ex.getMessage(), ex);
            }
        }

        // 3. Post-quantum cryptographic signing with CRYSTALS-Dilithium3
        String canonicalPayload = request.sourceAccountId() + ":" + request.targetAccountId() + ":" + transferAmount + ":" + effectiveIdempotencyKey;
        String pqcSignature = null;

        if (sourceAccount.pqcKeyId() != null && !sourceAccount.pqcKeyId().isBlank()) {
            try {
                log.info("Signing transaction payload with Dilithium3 via pqc-vault-service (keyId: {})", sourceAccount.pqcKeyId());
                PqcSignResponse signResponse = pqcVaultClient.sign(new PqcSignRequest(
                        UUID.fromString(sourceAccount.pqcKeyId()),
                        canonicalPayload
                ));
                if (signResponse != null && signResponse.signature() != null) {
                    pqcSignature = signResponse.signature();
                    log.info("Dilithium3 signature successfully obtained (length: {} chars)", pqcSignature.length());
                }
            } catch (Exception ex) {
                log.warn("PQC signing via pqc-vault-service failed ({}: {}). Continuing without quantum signature.",
                        ex.getClass().getSimpleName(), ex.getMessage());
            }
        }

        // 4. Atomic DEBIT step (with PQC signature and canonical payload)
        accountClient.updateBalance(
                request.sourceAccountId(),
                new UpdateBalanceRequest(
                        transferAmount,
                        "DEBIT",
                        "TXN-" + effectiveIdempotencyKey,
                        pqcSignature,
                        canonicalPayload
                )
        );

        // 5. Atomic CREDIT step
        try {
            accountClient.updateBalance(
                    request.targetAccountId(),
                    new UpdateBalanceRequest(
                            targetAmount,
                            "CREDIT",
                            "TXN-" + effectiveIdempotencyKey
                    )
            );
        } catch (Exception ex) {
            log.error("Failed to credit target account {}, attempting compensatory credit to source {}",
                    request.targetAccountId(), request.sourceAccountId(), ex);
            try {
                accountClient.updateBalance(
                        request.sourceAccountId(),
                        new UpdateBalanceRequest(transferAmount, "CREDIT", "REVERSAL-" + effectiveIdempotencyKey)
                );
            } catch (Exception revEx) {
                log.error("Critical: failed compensatory transaction for source account {}", request.sourceAccountId(), revEx);
            }
            throw new TransferExecutionException("Transfer failed during credit step: " + ex.getMessage(), ex);
        }

        // 6. Persist completed transaction audit trail
        TransactionEntity entity = new TransactionEntity(
                effectiveIdempotencyKey,
                request.sourceAccountId(),
                request.targetAccountId(),
                transferAmount,
                sourceAccount.currency(),
                targetAmount,
                targetAccount.currency(),
                exchangeRate,
                pqcSignature,
                canonicalPayload,
                "SUCCESS",
                request.description() != null ? request.description() : "Quantum-secured money transfer"
        );

        TransactionEntity saved = transactionRepository.save(entity);
        log.info("Transfer completed successfully: id={}, source={} {}, target={} {}, rate={}",
                saved.getId(), transferAmount, sourceAccount.currency(), targetAmount, targetAccount.currency(), exchangeRate);
        return toDto(saved);
    }

    /**
     * Fallback method triggered by Resilience4j Circuit Breaker
     */
    public TransactionDto executeTransferFallback(CreateTransactionRequest request, String idempotencyKey, Throwable throwable) {
        log.warn("Circuit Breaker triggered for transfer (source: {}, target: {}). Reason: {}",
                request.sourceAccountId(), request.targetAccountId(), throwable.getMessage());

        String key = (idempotencyKey != null && !idempotencyKey.isBlank())
                ? idempotencyKey
                : UUID.randomUUID().toString();

        TransactionEntity fallbackEntity = new TransactionEntity(
                key,
                request.sourceAccountId(),
                request.targetAccountId(),
                request.amount(),
                "RUB",
                "PENDING_FALLBACK",
                "Circuit Breaker active: downstream service is temporarily unavailable (" + throwable.getClass().getSimpleName() + "). Transfer deferred."
        );

        TransactionEntity saved = transactionRepository.save(fallbackEntity);
        return toDto(saved);
    }

    private TransactionDto toDto(TransactionEntity entity) {
        return new TransactionDto(
                entity.getId(),
                entity.getIdempotencyKey(),
                entity.getSourceAccountId(),
                entity.getTargetAccountId(),
                entity.getAmount(),
                entity.getCurrency(),
                entity.getStatus(),
                entity.getDescription(),
                entity.getCreatedAt(),
                entity.getTargetAmount(),
                entity.getTargetCurrency(),
                entity.getExchangeRate(),
                entity.getPqcSignature()
        );
    }
}
