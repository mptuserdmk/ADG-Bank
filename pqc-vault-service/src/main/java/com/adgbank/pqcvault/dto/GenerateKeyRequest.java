package com.adgbank.pqcvault.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to generate a new CRYSTALS-Dilithium3 keypair for an account")
public record GenerateKeyRequest(
        @Schema(description = "Unique account ID / Wallet ID owning the keys", example = "ACC-EUR-9169")
        @NotBlank(message = "Account ID is required")
        String accountId
) {}

