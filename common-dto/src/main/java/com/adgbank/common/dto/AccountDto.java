package com.adgbank.common.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AccountDto(
        Long id,
        Long userId,
        String accountNumber,
        BigDecimal balance,
        String currency,
        String status,
        Instant createdAt
) {}

