package com.adgbank.pqcvault.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Response containing the post-quantum digital signature")
public record SignResponse(
        @Schema(description = "UUID of the KeyRecord used for signing")
        UUID keyId,

        @Schema(description = "Algorithm used to produce signature", example = "CRYSTALS-Dilithium3")
        String algorithm,

        @Schema(description = "Base64-encoded CRYSTALS-Dilithium3 signature bytes (~4.4 KB)")
        String signature
) {}

