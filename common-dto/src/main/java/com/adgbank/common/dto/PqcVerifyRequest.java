package com.adgbank.common.dto;

import java.util.UUID;

public record PqcVerifyRequest(
        UUID keyId,
        String publicKey,
        String data,
        String signature
) {
    public PqcVerifyRequest(UUID keyId, String data, String signature) {
        this(keyId, null, data, signature);
    }
}

