package com.adgbank.marketrate.controller;

import com.adgbank.marketrate.dto.ConversionResponse;
import com.adgbank.marketrate.dto.ExchangeRateResponse;
import com.adgbank.marketrate.exception.GlobalExceptionHandler;
import com.adgbank.marketrate.exception.UnsupportedCurrencyException;
import com.adgbank.marketrate.service.MarketRateService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MarketRateController.class)
@Import(GlobalExceptionHandler.class)
class MarketRateControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MarketRateService marketRateService;

    @Test
    @DisplayName("GET /api/v1/rates - Should return exchange rate")
    void shouldReturnExchangeRate() throws Exception {
        ExchangeRateResponse mockResponse = new ExchangeRateResponse(
                "BTC",
                "USDT",
                new BigDecimal("68500.00000000"),
                Instant.now()
        );

        when(marketRateService.getExchangeRate("BTC", "USDT")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/rates")
                        .param("from", "BTC")
                        .param("to", "USDT")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.from").value("BTC"))
                .andExpect(jsonPath("$.to").value("USDT"))
                .andExpect(jsonPath("$.rate").value(68500.00000000));
    }

    @Test
    @DisplayName("GET /api/v1/rates/convert - Should return converted amount")
    void shouldReturnConvertedAmount() throws Exception {
        BigDecimal amount = new BigDecimal("2.0");
        ConversionResponse mockResponse = new ConversionResponse(
                "BTC",
                "USDT",
                amount,
                new BigDecimal("137000.00"),
                new BigDecimal("68500.00000000"),
                Instant.now()
        );

        when(marketRateService.convert("BTC", "USDT", amount)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/rates/convert")
                        .param("from", "BTC")
                        .param("to", "USDT")
                        .param("amount", "2.0")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.from").value("BTC"))
                .andExpect(jsonPath("$.to").value("USDT"))
                .andExpect(jsonPath("$.amount").value(2.0))
                .andExpect(jsonPath("$.convertedAmount").value(137000.00));
    }

    @Test
    @DisplayName("GET /api/v1/rates - Should return 400 for unsupported currency")
    void shouldReturn400ForUnsupportedCurrency() throws Exception {
        when(marketRateService.getExchangeRate("ABC", "XYZ"))
                .thenThrow(new UnsupportedCurrencyException("ABC"));

        mockMvc.perform(get("/api/v1/rates")
                        .param("from", "ABC")
                        .param("to", "XYZ")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Unsupported Currency"));
    }

    @Test
    @DisplayName("GET /api/v1/rates/supported - Should return supported currencies set")
    void shouldReturnSupportedCurrencies() throws Exception {
        when(marketRateService.getSupportedCurrencies()).thenReturn(Set.of("BTC", "USDT", "USD", "EUR", "RUB"));

        mockMvc.perform(get("/api/v1/rates/supported")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));
    }
}

