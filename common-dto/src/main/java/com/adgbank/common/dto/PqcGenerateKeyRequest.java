package com.adgbank.common.dto;

import java.time.Instant;
import java.util.UUID;

public record PqcGenerateKeyRequest(
        String accountId
) {}

