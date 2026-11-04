package com.adgbank.pqcvault.crypto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AesGcmCipherTest {

    private AesGcmCipher cipher;

    @BeforeEach
    void setUp() {
        cipher = new AesGcmCipher("test-master-key-with-sufficient-entropy-12345");
    }

    @Test
    @DisplayName("Should successfully encrypt and decrypt data roundtrip")
    void shouldEncryptAndDecryptSuccessfully() {
        byte[] original = "Quantum-Secret-Dilithium-Key-Payload-2026".getBytes(StandardCharsets.UTF_8);

        String encrypted = cipher.encrypt(original);
        assertThat(encrypted).isNotNull().isNotBlank();

        byte[] decrypted = cipher.decrypt(encrypted);
        assertThat(decrypted).isEqualTo(original);
        assertThat(new String(decrypted, StandardCharsets.UTF_8)).isEqualTo("Quantum-Secret-Dilithium-Key-Payload-2026");
    }

    @Test
    @DisplayName("Should detect tampered ciphertext via GCM authentication tag failure")
    void shouldFailDecryptionWhenCiphertextIsTampered() {
        byte[] original = "Tamper-Proof-Data".getBytes(StandardCharsets.UTF_8);
        String encrypted = cipher.encrypt(original);

        byte[] decoded = Base64.getDecoder().decode(encrypted);
        // Tamper with the last byte (part of auth tag or ciphertext)
        decoded[decoded.length - 1] ^= 0x01;
        String tampered = Base64.getEncoder().encodeToString(decoded);

        assertThatThrownBy(() -> cipher.decrypt(tampered))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to decrypt AES-GCM payload");
    }

    @Test
    @DisplayName("Should fail when decrypting with a different master key")
    void shouldFailWithDifferentKey() {
        byte[] original = "Classified-PQC-Key".getBytes(StandardCharsets.UTF_8);
        String encrypted = cipher.encrypt(original);

        AesGcmCipher differentCipher = new AesGcmCipher("totally-different-master-key-99999");

        assertThatThrownBy(() -> differentCipher.decrypt(encrypted))
                .isInstanceOf(IllegalStateException.class);
    }
}

