package com.adgbank.marketrate.service;

import com.adgbank.marketrate.dto.ConversionResponse;
import com.adgbank.marketrate.dto.ExchangeRateResponse;
import com.adgbank.marketrate.exception.UnsupportedCurrencyException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MarketRateServiceTest {

    private MarketRateService marketRateService;

    @BeforeEach
    void setUp() {
        marketRateService = new MarketRateServiceImpl();
    }

    @Test
    @DisplayName("Should return 1.0 rate when from and to currencies are identical")
    void shouldReturnOneForIdenticalCurrencies() {
        ExchangeRateResponse response = marketRateService.getExchangeRate("USDT", "usdt");

        assertThat(response.from()).isEqualTo("USDT");
        assertThat(response.to()).isEqualTo("USDT");
        assertThat(response.rate()).isEqualByComparingTo(BigDecimal.ONE);
    }

    @Test
    @DisplayName("Should correctly calculate BTC to USDT exchange rate")
    void shouldCalculateBtcToUsdtRate() {
        ExchangeRateResponse response = marketRateService.getExchangeRate("BTC", "USDT");

        assertThat(response.from()).isEqualTo("BTC");
        assertThat(response.to()).isEqualTo("USDT");
        assertThat(response.rate()).isEqualByComparingTo(new BigDecimal("68500.00000000"));
    }

    @Test
    @DisplayName("Should correctly calculate USDT to BTC exchange rate with 8 decimal places")
    void shouldCalculateUsdtToBtcRate() {
        ExchangeRateResponse response = marketRateService.getExchangeRate("USDT", "BTC");

        assertThat(response.from()).isEqualTo("USDT");
        assertThat(response.to()).isEqualTo("BTC");
        // 1 / 68500 = 0.00001460
        assertThat(response.rate()).isEqualByComparingTo(new BigDecimal("0.00001460"));
    }

    @Test
    @DisplayName("Should convert BTC to USDT accurately")
    void shouldConvertBtcToUsdt() {
        BigDecimal btcAmount = new BigDecimal("2.5");
        ConversionResponse response = marketRateService.convert("BTC", "USDT", btcAmount);

        assertThat(response.from()).isEqualTo("BTC");
        assertThat(response.to()).isEqualTo("USDT");
        assertThat(response.amount()).isEqualTo(btcAmount);
        // 2.5 * 68500 = 171250.00
        assertThat(response.convertedAmount()).isEqualByComparingTo(new BigDecimal("171250.00"));
    }

    @Test
    @DisplayName("Should throw UnsupportedCurrencyException for unknown currency code")
    void shouldThrowForUnknownCurrency() {
        assertThatThrownBy(() -> marketRateService.getExchangeRate("DOGE", "USDT"))
                .isInstanceOf(UnsupportedCurrencyException.class)
                .hasMessageContaining("DOGE");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when amount is negative")
    void shouldThrowForNegativeAmount() {
        assertThatThrownBy(() -> marketRateService.convert("USDT", "EUR", new BigDecimal("-10.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("greater than or equal to zero");
    }

    @Test
    @DisplayName("Should return all 5 supported currencies")
    void shouldReturnSupportedCurrencies() {
        assertThat(marketRateService.getSupportedCurrencies())
                .containsExactlyInAnyOrder("BTC", "USDT", "USD", "EUR", "RUB");
    }
}

