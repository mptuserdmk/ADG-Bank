package com.adgbank.pqcvault.crypto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class PqcDilithiumEngineTest {

    private PqcDilithiumEngine engine;

    @BeforeEach
    void setUp() {
        engine = new PqcDilithiumEngine();
    }

    @Test
    @DisplayName("Should generate valid Dilithium3 keypair with expected byte sizes")
    void shouldGenerateDilithium3KeyPair() {
        PqcDilithiumEngine.RawDilithiumKeyPair keyPair = engine.generateKeyPair();

        assertThat(keyPair).isNotNull();
        assertThat(keyPair.publicKeyBytes()).isNotNull();
        assertThat(keyPair.privateKeyBytes()).isNotNull();

        // CRYSTALS-Dilithium3 public key size is 1952 bytes, private key is 4032 bytes in BC 1.78+
        assertThat(keyPair.publicKeyBytes().length).isEqualTo(1952);
        assertThat(keyPair.privateKeyBytes().length).isEqualTo(4032);
    }

    @Test
    @DisplayName("Should sign canonical payload and verify signature successfully")
    void shouldSignAndVerifyCanonicalPayload() {
        PqcDilithiumEngine.RawDilithiumKeyPair keyPair = engine.generateKeyPair();

        String canonicalPayload = "ACC-001:ACC-002:1500.00:idempotency-uuid-777";
        byte[] message = canonicalPayload.getBytes(StandardCharsets.UTF_8);

        byte[] signature = engine.sign(keyPair.privateKeyBytes(), message);
        assertThat(signature).isNotNull();
        // Dilithium3 signature size is 3309 bytes in BC 1.78+
        assertThat(signature.length).isEqualTo(3309);

        boolean isValid = engine.verify(keyPair.publicKeyBytes(), message, signature);
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should reject verification when payload is modified (tampered)")
    void shouldRejectWhenPayloadIsModified() {
        PqcDilithiumEngine.RawDilithiumKeyPair keyPair = engine.generateKeyPair();

        byte[] originalMessage = "ACC-001:ACC-002:100.00:tx-123".getBytes(StandardCharsets.UTF_8);
        byte[] tamperedMessage = "ACC-001:ACC-002:999999.00:tx-123".getBytes(StandardCharsets.UTF_8);

        byte[] signature = engine.sign(keyPair.privateKeyBytes(), originalMessage);

        boolean isValid = engine.verify(keyPair.publicKeyBytes(), tamperedMessage, signature);
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should reject verification when signature is corrupted")
    void shouldRejectWhenSignatureIsCorrupted() {
        PqcDilithiumEngine.RawDilithiumKeyPair keyPair = engine.generateKeyPair();
        byte[] message = "Test-Message".getBytes(StandardCharsets.UTF_8);

        byte[] signature = engine.sign(keyPair.privateKeyBytes(), message);
        signature[10] ^= 0x55; // Corrupt a byte in signature

        boolean isValid = engine.verify(keyPair.publicKeyBytes(), message, signature);
        assertThat(isValid).isFalse();
    }
}
