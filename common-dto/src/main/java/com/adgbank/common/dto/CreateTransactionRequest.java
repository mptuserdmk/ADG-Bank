package com.adgbank.common.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateTransactionRequest(
        @NotNull(message = "Source account ID is required")
        Long sourceAccountId,

        @NotNull(message = "Target account ID is required")
        Long targetAccountId,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.00000001", message = "Transfer amount must be greater than zero")
        BigDecimal amount,

        String description
) {}
