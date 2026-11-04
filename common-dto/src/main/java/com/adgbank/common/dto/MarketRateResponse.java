package com.adgbank.common.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MarketRateResponse(
        String fromCurrency,
        String toCurrency,
        BigDecimal rate,
        Instant timestamp
) {}

