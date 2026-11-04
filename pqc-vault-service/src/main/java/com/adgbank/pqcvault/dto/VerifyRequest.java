package com.adgbank.pqcvault.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

@Schema(description = "Request to verify CRYSTALS-Dilithium3 post-quantum signature")
public record VerifyRequest(
        @Schema(description = "Optional KeyRecord UUID if public key is stored in vault", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID keyId,

        @Schema(description = "Optional Base64-encoded public key if verifying without KeyRecord lookup")
        String publicKey,

        @Schema(description = "Canonical payload string that was signed",
                example = "ACC-EUR-001:ACC-EUR-002:100.50:4fa85f64-5717-4562-b3fc-2c963f66afa7")
        @NotBlank(message = "Data payload is required")
        String data,

        @Schema(description = "Base64-encoded CRYSTALS-Dilithium3 signature bytes to verify")
        @NotBlank(message = "Signature is required")
        String signature
) {}

