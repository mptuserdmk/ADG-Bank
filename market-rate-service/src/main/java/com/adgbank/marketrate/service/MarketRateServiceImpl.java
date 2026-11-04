package com.adgbank.marketrate.service;

import com.adgbank.marketrate.dto.ConversionResponse;
import com.adgbank.marketrate.dto.ExchangeRateResponse;
import com.adgbank.marketrate.exception.UnsupportedCurrencyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketRateServiceImpl implements MarketRateService {

    private static final Logger log = LoggerFactory.getLogger(MarketRateServiceImpl.class);

    private static final int RATE_SCALE = 8;
    private static final int FIAT_SCALE = 2;
    private static final int CRYPTO_SCALE = 8;

    /**
     * Base reference prices in USD: 1 unit of currency = priceInUsd USD.
     */
    private final Map<String, BigDecimal> basePriceInUsd = new ConcurrentHashMap<>();

    public MarketRateServiceImpl() {
        // Initialize market reference prices in USD
        basePriceInUsd.put("USD", new BigDecimal("1.00000000"));
        basePriceInUsd.put("USDT", new BigDecimal("1.00000000"));
        basePriceInUsd.put("EUR", new BigDecimal("1.08500000"));
        basePriceInUsd.put("RUB", new BigDecimal("0.01050000")); // 1 USD ~ 95.238 RUB
        basePriceInUsd.put("BTC", new BigDecimal("68500.00000000"));
    }

    @Override
    public ExchangeRateResponse getExchangeRate(String from, String to) {
        String source = normalizeCurrency(from);
        String target = normalizeCurrency(to);

        validateCurrency(source);
        validateCurrency(target);

        BigDecimal rate;
        if (source.equals(target)) {
            rate = BigDecimal.ONE.setScale(RATE_SCALE, RoundingMode.HALF_EVEN);
        } else {
            BigDecimal sourcePriceInUsd = basePriceInUsd.get(source);
            BigDecimal targetPriceInUsd = basePriceInUsd.get(target);

            // Cross-rate: rate = sourcePriceInUsd / targetPriceInUsd
            rate = sourcePriceInUsd.divide(targetPriceInUsd, RATE_SCALE, RoundingMode.HALF_EVEN);
        }

        log.info("Market rate requested: {} -> {}, calculated rate: {}", source, target, rate);
        return new ExchangeRateResponse(source, target, rate, Instant.now());
    }

    @Override
    public ConversionResponse convert(String from, String to, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount must be non-null and greater than or equal to zero");
        }

        ExchangeRateResponse rateResponse = getExchangeRate(from, to);
        BigDecimal rate = rateResponse.rate();

        int targetScale = isCrypto(rateResponse.to()) ? CRYPTO_SCALE : FIAT_SCALE;
        BigDecimal convertedAmount = amount.multiply(rate).setScale(targetScale, RoundingMode.HALF_EVEN);

        log.info("Converted {} {} to {} {} (rate: {})", amount, rateResponse.from(), convertedAmount, rateResponse.to(), rate);
        return new ConversionResponse(
                rateResponse.from(),
                rateResponse.to(),
                amount,
                convertedAmount,
                rate,
                rateResponse.timestamp()
        );
    }

    @Override
    public Set<String> getSupportedCurrencies() {
        return Collections.unmodifiableSet(basePriceInUsd.keySet());
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("Currency code must not be null or blank");
        }
        return currency.trim().toUpperCase();
    }

    private void validateCurrency(String currency) {
        if (!basePriceInUsd.containsKey(currency)) {
            throw new UnsupportedCurrencyException(currency);
        }
    }

    private boolean isCrypto(String currency) {
        return "BTC".equals(currency);
    }
}

