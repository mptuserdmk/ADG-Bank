package com.adgbank.common.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record CreateAccountRequest(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotBlank(message = "Currency is required")
        @Pattern(regexp = "^(RUB|USD|EUR|BTC|USDT)$", message = "Currency must be RUB, USD, EUR, BTC, or USDT")
        String currency,

        @DecimalMin(value = "0.00", message = "Initial deposit cannot be negative")
        BigDecimal initialDeposit
) {}
