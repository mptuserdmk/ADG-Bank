package com.adgbank.transactionservice.client;

import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.UpdateBalanceRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "account-service")
public interface AccountClient {

    @GetMapping("/api/accounts/{id}")
    AccountDto getAccountById(@PathVariable("id") Long id);

    @PutMapping("/api/accounts/{id}/balance")
    AccountDto updateBalance(@PathVariable("id") Long id, @RequestBody UpdateBalanceRequest request);
}

