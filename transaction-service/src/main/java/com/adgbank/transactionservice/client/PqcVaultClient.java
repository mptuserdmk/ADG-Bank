package com.adgbank.transactionservice.client;

import com.adgbank.common.dto.PqcSignRequest;
import com.adgbank.common.dto.PqcSignResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "pqc-vault-service")
public interface PqcVaultClient {

    @PostMapping("/api/v1/vault/sign")
    PqcSignResponse sign(@RequestBody PqcSignRequest request);
}

