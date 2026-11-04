package com.adgbank.common.dto;

import java.util.UUID;

public record PqcSignRequest(
        UUID keyId,
        String data
) {}

