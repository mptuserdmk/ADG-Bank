package com.adgbank.marketrate.service;

import com.adgbank.marketrate.dto.ConversionResponse;
import com.adgbank.marketrate.dto.ExchangeRateResponse;

import java.math.BigDecimal;
import java.util.Set;

public interface MarketRateService {

    ExchangeRateResponse getExchangeRate(String from, String to);

    ConversionResponse convert(String from, String to, BigDecimal amount);

    Set<String> getSupportedCurrencies();
}

