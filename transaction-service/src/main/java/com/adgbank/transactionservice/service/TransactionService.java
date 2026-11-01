package com.adgbank.transactionservice.service;

import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateTransactionRequest;
import com.adgbank.common.dto.TransactionDto;
import com.adgbank.common.dto.UpdateBalanceRequest;
import com.adgbank.transactionservice.client.AccountClient;
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
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final AccountClient accountClient;

    public TransactionService(TransactionRepository transactionRepository, AccountClient accountClient) {
        this.transactionRepository = transactionRepository;
        this.accountClient = accountClient;
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

        BigDecimal transferAmount = request.amount().setScale(2, RoundingMode.HALF_EVEN);

        // 1. Verify accounts existence and matching currencies via Feign
        AccountDto sourceAccount = accountClient.getAccountById(request.sourceAccountId());
        AccountDto targetAccount = accountClient.getAccountById(request.targetAccountId());

        if (sourceAccount == null || targetAccount == null) {
            throw new TransferExecutionException("One or both accounts could not be retrieved from account-service");
        }

        if (!sourceAccount.currency().equalsIgnoreCase(targetAccount.currency())) {
            throw new IllegalArgumentException(String.format(
                    "Currency mismatch: source account is %s, target account is %s. Multi-currency transfers not supported yet.",
                    sourceAccount.currency(), targetAccount.currency()
            ));
        }

        // 2. Perform atomic debit and credit
        accountClient.updateBalance(
                request.sourceAccountId(),
                new UpdateBalanceRequest(transferAmount, "DEBIT", "TXN-" + effectiveIdempotencyKey)
        );

        try {
            accountClient.updateBalance(
                    request.targetAccountId(),
                    new UpdateBalanceRequest(transferAmount, "CREDIT", "TXN-" + effectiveIdempotencyKey)
            );
        } catch (Exception ex) {
            // Rollback debit on credit failure
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

        // 3. Persist successful transaction record
        TransactionEntity entity = new TransactionEntity(
                effectiveIdempotencyKey,
                request.sourceAccountId(),
                request.targetAccountId(),
                transferAmount,
                sourceAccount.currency(),
                "SUCCESS",
                request.description() != null ? request.description() : "Standard money transfer"
        );

        TransactionEntity saved = transactionRepository.save(entity);
        log.info("Transfer completed successfully: id={}, amount={} {}", saved.getId(), transferAmount, sourceAccount.currency());
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
                "Circuit Breaker active: account-service is temporarily unavailable (" + throwable.getClass().getSimpleName() + "). Transfer deferred."
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
                entity.getCreatedAt()
        );
    }
}

