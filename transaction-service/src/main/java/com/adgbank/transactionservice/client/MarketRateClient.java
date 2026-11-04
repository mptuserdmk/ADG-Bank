package com.adgbank.transactionservice.client;

import com.adgbank.common.dto.MarketConversionResponse;
import com.adgbank.common.dto.MarketRateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

@FeignClient(name = "market-rate-service")
public interface MarketRateClient {

    @GetMapping("/api/v1/rates")
    MarketRateResponse getExchangeRate(@RequestParam("from") String from, @RequestParam("to") String to);

    @GetMapping("/api/v1/rates/convert")
    MarketConversionResponse convert(
            @RequestParam("from") String from,
            @RequestParam("to") String to,
            @RequestParam("amount") BigDecimal amount
    );
}

