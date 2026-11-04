package com.adgbank.pqcvault.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Verification result for post-quantum digital signature")
public record VerifyResponse(
        @Schema(description = "True if Dilithium3 signature is mathematically valid, false otherwise", example = "true")
        boolean valid,

        @Schema(description = "Explanatory message", example = "CRYSTALS-Dilithium3 signature is valid")
        String message,

        @Schema(description = "Algorithm", example = "CRYSTALS-Dilithium3")
        String algorithm
) {}

