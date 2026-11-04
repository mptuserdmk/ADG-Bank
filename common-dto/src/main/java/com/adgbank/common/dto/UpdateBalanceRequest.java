package com.adgbank.common.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record UpdateBalanceRequest(
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.00000001", message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotBlank(message = "Operation type is required")
        @Pattern(regexp = "^(DEBIT|CREDIT)$", message = "Operation type must be DEBIT or CREDIT")
        String operationType,

        String referenceId,

        String pqcSignature,

        String canonicalPayload
) {
    public UpdateBalanceRequest(BigDecimal amount, String operationType, String referenceId) {
        this(amount, operationType, referenceId, null, null);
    }
}
