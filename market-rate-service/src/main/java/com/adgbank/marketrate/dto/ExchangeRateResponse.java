package com.adgbank.marketrate.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;

@Schema(description = "Exchange rate details between two currency assets")
public record ExchangeRateResponse(
        @Schema(description = "Source currency code", example = "BTC")
        String from,

        @Schema(description = "Target currency code", example = "USDT")
        String to,

        @Schema(description = "Exchange rate (1 unit of 'from' equals rate units of 'to')", example = "68500.00000000")
        BigDecimal rate,

        @Schema(description = "Timestamp when the rate was calculated")
        Instant timestamp
) {}

