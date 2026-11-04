package com.adgbank.common.dto;

public record PqcVerifyResponse(
        boolean valid,
        String message,
        String algorithm
) {}

