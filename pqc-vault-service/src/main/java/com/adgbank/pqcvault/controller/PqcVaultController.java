package com.adgbank.pqcvault.controller;

import com.adgbank.pqcvault.dto.GenerateKeyRequest;
import com.adgbank.pqcvault.dto.KeyResponse;
import com.adgbank.pqcvault.dto.SignRequest;
import com.adgbank.pqcvault.dto.SignResponse;
import com.adgbank.pqcvault.dto.VerifyRequest;
import com.adgbank.pqcvault.dto.VerifyResponse;
import com.adgbank.pqcvault.service.PqcVaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vault")
@Tag(name = "Post-Quantum Cryptography Vault", description = "CRYSTALS-Dilithium3 key management, signing and verification endpoints")
public class PqcVaultController {

    private static final Logger log = LoggerFactory.getLogger(PqcVaultController.class);

    private final PqcVaultService pqcVaultService;

    public PqcVaultController(PqcVaultService pqcVaultService) {
        this.pqcVaultService = pqcVaultService;
    }

    @PostMapping("/keys")
    @Operation(summary = "Generate a new CRYSTALS-Dilithium3 keypair", description = "Generates post-quantum keypair, stores encrypted private key in vault_db, and returns public key metadata")
    @ApiResponse(responseCode = "201", description = "Keypair successfully generated and stored")
    public ResponseEntity<KeyResponse> generateKey(@Valid @RequestBody GenerateKeyRequest request) {
        log.info("REST request to generate PQC keypair for account: {}", request.accountId());
        KeyResponse response = pqcVaultService.generateKeyPair(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/sign")
    @Operation(summary = "Sign payload with CRYSTALS-Dilithium3", description = "Signs canonical transaction string using decrypted private key identified by keyId")
    @ApiResponse(responseCode = "200", description = "Signature successfully generated")
    public ResponseEntity<SignResponse> sign(@Valid @RequestBody SignRequest request) {
        log.info("REST request to sign payload for keyId: {}", request.keyId());
        SignResponse response = pqcVaultService.sign(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify CRYSTALS-Dilithium3 signature", description = "Verifies post-quantum signature against data using public key from vault or provided inline")
    @ApiResponse(responseCode = "200", description = "Verification performed successfully")
    public ResponseEntity<VerifyResponse> verify(@Valid @RequestBody VerifyRequest request) {
        log.info("REST request to verify PQC signature (keyId: {})", request.keyId());
        VerifyResponse response = pqcVaultService.verify(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/keys/{keyId}")
    @Operation(summary = "Get PQC key metadata and public key by Key ID")
    @ApiResponse(responseCode = "200", description = "Key record found")
    public ResponseEntity<KeyResponse> getKey(@PathVariable UUID keyId) {
        return ResponseEntity.ok(pqcVaultService.getKey(keyId));
    }

    @GetMapping("/keys/account/{accountId}")
    @Operation(summary = "Get latest PQC key for an account")
    @ApiResponse(responseCode = "200", description = "Latest key found for account")
    public ResponseEntity<KeyResponse> getLatestKeyForAccount(@PathVariable String accountId) {
        return ResponseEntity.ok(pqcVaultService.getLatestKeyForAccount(accountId));
    }
}

