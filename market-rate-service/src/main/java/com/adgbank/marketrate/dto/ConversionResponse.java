package com.adgbank.marketrate.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;

@Schema(description = "Result of converting an amount from one currency to another")
public record ConversionResponse(
        @Schema(description = "Source currency code", example = "BTC")
        String from,

        @Schema(description = "Target currency code", example = "USDT")
        String to,

        @Schema(description = "Original input amount", example = "0.50000000")
        BigDecimal amount,

        @Schema(description = "Converted output amount", example = "34250.0000")
        BigDecimal convertedAmount,

        @Schema(description = "Applied exchange rate", example = "68500.00000000")
        BigDecimal rate,

        @Schema(description = "Timestamp of conversion")
        Instant timestamp
) {}

