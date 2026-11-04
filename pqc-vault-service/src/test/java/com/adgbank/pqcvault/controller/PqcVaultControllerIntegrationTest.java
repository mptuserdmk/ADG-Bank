package com.adgbank.pqcvault.controller;

import com.adgbank.pqcvault.dto.GenerateKeyRequest;
import com.adgbank.pqcvault.dto.KeyResponse;
import com.adgbank.pqcvault.dto.SignRequest;
import com.adgbank.pqcvault.dto.SignResponse;
import com.adgbank.pqcvault.dto.VerifyRequest;
import com.adgbank.pqcvault.dto.VerifyResponse;
import com.adgbank.pqcvault.exception.GlobalExceptionHandler;
import com.adgbank.pqcvault.service.PqcVaultService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PqcVaultController.class)
@Import(GlobalExceptionHandler.class)
class PqcVaultControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PqcVaultService pqcVaultService;

    @Test
    @DisplayName("POST /api/v1/vault/keys - Should generate and return keypair metadata")
    void shouldGenerateKeypairSuccessfully() throws Exception {
        UUID keyId = UUID.randomUUID();
        KeyResponse mockResponse = new KeyResponse(
                keyId,
                "ACC-EUR-9169",
                "CRYSTALS-Dilithium3",
                "base64-mock-public-key",
                Instant.now()
        );

        when(pqcVaultService.generateKeyPair(any(GenerateKeyRequest.class))).thenReturn(mockResponse);

        GenerateKeyRequest request = new GenerateKeyRequest("ACC-EUR-9169");

        mockMvc.perform(post("/api/v1/vault/keys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.keyId").value(keyId.toString()))
                .andExpect(jsonPath("$.accountId").value("ACC-EUR-9169"))
                .andExpect(jsonPath("$.algorithm").value("CRYSTALS-Dilithium3"))
                .andExpect(jsonPath("$.publicKey").value("base64-mock-public-key"));
    }

    @Test
    @DisplayName("POST /api/v1/vault/sign - Should sign canonical payload")
    void shouldSignPayloadSuccessfully() throws Exception {
        UUID keyId = UUID.randomUUID();
        SignResponse mockResponse = new SignResponse(
                keyId,
                "CRYSTALS-Dilithium3",
                "base64-mock-dilithium-signature"
        );

        when(pqcVaultService.sign(any(SignRequest.class))).thenReturn(mockResponse);

        SignRequest request = new SignRequest(keyId, "ACC-1:ACC-2:100.00:idemp-1");

        mockMvc.perform(post("/api/v1/vault/sign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keyId").value(keyId.toString()))
                .andExpect(jsonPath("$.algorithm").value("CRYSTALS-Dilithium3"))
                .andExpect(jsonPath("$.signature").value("base64-mock-dilithium-signature"));
    }

    @Test
    @DisplayName("POST /api/v1/vault/verify - Should verify Dilithium signature")
    void shouldVerifySignatureSuccessfully() throws Exception {
        UUID keyId = UUID.randomUUID();
        VerifyResponse mockResponse = new VerifyResponse(
                true,
                "CRYSTALS-Dilithium3 signature is valid",
                "CRYSTALS-Dilithium3"
        );

        when(pqcVaultService.verify(any(VerifyRequest.class))).thenReturn(mockResponse);

        VerifyRequest request = new VerifyRequest(keyId, null, "ACC-1:ACC-2:100.00:idemp-1", "mock-sig");

        mockMvc.perform(post("/api/v1/vault/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.message").value("CRYSTALS-Dilithium3 signature is valid"));
    }

    @Test
    @DisplayName("GET /api/v1/vault/keys/{keyId} - Should return key record")
    void shouldReturnKeyById() throws Exception {
        UUID keyId = UUID.randomUUID();
        KeyResponse mockResponse = new KeyResponse(
                keyId,
                "ACC-EUR-9169",
                "CRYSTALS-Dilithium3",
                "base64-mock-public-key",
                Instant.now()
        );

        when(pqcVaultService.getKey(keyId)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/vault/keys/" + keyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keyId").value(keyId.toString()))
                .andExpect(jsonPath("$.accountId").value("ACC-EUR-9169"));
    }
}

