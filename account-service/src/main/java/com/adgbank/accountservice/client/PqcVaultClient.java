package com.adgbank.accountservice.client;

import com.adgbank.common.dto.PqcGenerateKeyRequest;
import com.adgbank.common.dto.PqcKeyResponse;
import com.adgbank.common.dto.PqcVerifyRequest;
import com.adgbank.common.dto.PqcVerifyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "pqc-vault-service")
public interface PqcVaultClient {

    @PostMapping("/api/v1/vault/keys")
    PqcKeyResponse generateKey(@RequestBody PqcGenerateKeyRequest request);

    @PostMapping("/api/v1/vault/verify")
    PqcVerifyResponse verify(@RequestBody PqcVerifyRequest request);
}

