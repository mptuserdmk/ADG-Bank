package com.adgbank.marketrate.controller;

import com.adgbank.marketrate.dto.ConversionResponse;
import com.adgbank.marketrate.dto.ExchangeRateResponse;
import com.adgbank.marketrate.service.MarketRateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/rates")
@Tag(name = "Market Exchange Rates", description = "Real-time rates and currency conversion for BTC, USDT, USD, EUR, RUB")
public class MarketRateController {

    private static final Logger log = LoggerFactory.getLogger(MarketRateController.class);

    private final MarketRateService marketRateService;

    public MarketRateController(MarketRateService marketRateService) {
        this.marketRateService = marketRateService;
    }

    @GetMapping
    @Operation(summary = "Get exchange rate between two currencies", description = "Calculates cross-rate for supported currencies (BTC, USDT, USD, EUR, RUB)")
    @ApiResponse(responseCode = "200", description = "Exchange rate calculated successfully")
    @ApiResponse(responseCode = "400", description = "Unsupported currency or invalid parameters")
    public ResponseEntity<ExchangeRateResponse> getExchangeRate(
            @Parameter(description = "Source currency code", example = "BTC")
            @RequestParam String from,

            @Parameter(description = "Target currency code", example = "USDT")
            @RequestParam String to
    ) {
        log.info("REST request for rate from {} to {}", from, to);
        ExchangeRateResponse response = marketRateService.getExchangeRate(from, to);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/convert")
    @Operation(summary = "Convert monetary amount from one currency to another", description = "Applies live exchange rate and returns converted sum with correct asset precision")
    @ApiResponse(responseCode = "200", description = "Amount successfully converted")
    @ApiResponse(responseCode = "400", description = "Invalid parameters or negative amount")
    public ResponseEntity<ConversionResponse> convert(
            @Parameter(description = "Source currency code", example = "BTC")
            @RequestParam String from,

            @Parameter(description = "Target currency code", example = "USDT")
            @RequestParam String to,

            @Parameter(description = "Amount to convert", example = "0.25")
            @RequestParam BigDecimal amount
    ) {
        log.info("REST request to convert {} {} to {}", amount, from, to);
        ConversionResponse response = marketRateService.convert(from, to, amount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supported")
    @Operation(summary = "Get list of supported currencies", description = "Returns all available fiat and crypto currency codes")
    @ApiResponse(responseCode = "200", description = "List of supported currency codes")
    public ResponseEntity<Set<String>> getSupportedCurrencies() {
        return ResponseEntity.ok(marketRateService.getSupportedCurrencies());
    }
}

