package com.adgbank.common.dto;

import java.time.Instant;
import java.util.UUID;

public record PqcKeyResponse(
        UUID keyId,
        String accountId,
        String algorithm,
        String publicKey,
        Instant createdAt
) {}

