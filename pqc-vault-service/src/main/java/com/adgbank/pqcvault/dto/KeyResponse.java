package com.adgbank.pqcvault.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Response containing generated post-quantum key metadata and public key")
public record KeyResponse(
        @Schema(description = "Unique Key Record UUID", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        UUID keyId,

        @Schema(description = "Associated Account / Wallet ID", example = "ACC-EUR-9169")
        String accountId,

        @Schema(description = "Cryptographic algorithm name", example = "CRYSTALS-Dilithium3")
        String algorithm,

        @Schema(description = "Base64-encoded CRYSTALS-Dilithium3 public key (~2.6 KB)")
        String publicKey,

        @Schema(description = "Timestamp of key generation")
        Instant createdAt
) {}

