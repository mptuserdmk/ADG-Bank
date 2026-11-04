package com.adgbank.common.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionDto(
        Long id,
        String idempotencyKey,
        Long sourceAccountId,
        Long targetAccountId,
        BigDecimal amount,
        String currency,
        String status,
        String description,
        Instant createdAt,
        BigDecimal targetAmount,
        String targetCurrency,
        BigDecimal exchangeRate,
        String pqcSignature
) {
    public TransactionDto(Long id, String idempotencyKey, Long sourceAccountId, Long targetAccountId,
                          BigDecimal amount, String currency, String status, String description, Instant createdAt) {
        this(id, idempotencyKey, sourceAccountId, targetAccountId, amount, currency, status, description, createdAt,
                amount, currency, BigDecimal.ONE, null);
    }
}
