package com.adgbank.pqcvault.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(description = "Request to sign canonical transaction payload with CRYSTALS-Dilithium3")
public record SignRequest(
        @Schema(description = "UUID of the KeyRecord containing the encrypted private key", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        @NotNull(message = "Key ID is required")
        UUID keyId,

        @Schema(description = "Canonical payload string to sign (e.g. source:target:amount:idempotencyKey)",
                example = "ACC-EUR-001:ACC-EUR-002:100.50:4fa85f64-5717-4562-b3fc-2c963f66afa7")
        @NotBlank(message = "Data payload is required")
        String data
) {}

