package com.adgbank.common.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MarketConversionResponse(
        String fromCurrency,
        String toCurrency,
        BigDecimal originalAmount,
        BigDecimal rate,
        BigDecimal convertedAmount,
        Instant timestamp
) {}

