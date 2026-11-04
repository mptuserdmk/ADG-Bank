package com.adgbank.common.dto;

import java.util.UUID;

public record PqcSignResponse(
        UUID keyId,
        String algorithm,
        String signature
) {}

