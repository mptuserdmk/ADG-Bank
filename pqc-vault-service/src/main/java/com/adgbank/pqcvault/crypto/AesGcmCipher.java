package com.adgbank.pqcvault.crypto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

/**
 * Enterprise-grade AES-GCM-256 authenticated encryption utility for securing
 * post-quantum private keys at rest.
 * Uses AES/GCM/NoPadding with 96-bit randomized IV and 128-bit authentication tag.
 */
@Component
public class AesGcmCipher {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12; // 96 bits recommended for GCM
    private static final int TAG_LENGTH_BITS = 128; // 128-bit authentication tag

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;

    public AesGcmCipher(@Value("${vault.master-key:adg-quantum-bank-super-secret-vault-master-key-32b!}") String masterKeyString) {
        this.secretKey = deriveSecretKey(masterKeyString);
        this.secureRandom = new SecureRandom();
    }

    /**
     * Derives a deterministic 256-bit AES SecretKey from any string using SHA-256.
     */
    private SecretKey deriveSecretKey(String keyString) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha256.digest(keyString.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, "AES");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 digest algorithm unavailable", e);
        }
    }

    /**
     * Encrypts raw plaintext bytes using AES-256-GCM and prepends the random 12-byte IV.
     *
     * @param plaintext raw bytes to encrypt (e.g. Dilithium3 private key bytes)
     * @return Base64-encoded string combining [12-byte IV || ciphertext + auth tag]
     */
    public String encrypt(byte[] plaintext) {
        if (plaintext == null || plaintext.length == 0) {
            throw new IllegalArgumentException("Plaintext bytes must not be null or empty");
        }

        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherText = cipher.doFinal(plaintext);

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt data with AES-GCM", e);
        }
    }

    /**
     * Decrypts Base64-encoded ciphertext produced by {@link #encrypt(byte[])}.
     *
     * @param base64IvAndCiphertext Base64 string containing [12-byte IV || ciphertext + auth tag]
     * @return raw decrypted plaintext bytes
     */
    public byte[] decrypt(String base64IvAndCiphertext) {
        if (base64IvAndCiphertext == null || base64IvAndCiphertext.isBlank()) {
            throw new IllegalArgumentException("Encrypted payload must not be null or blank");
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(base64IvAndCiphertext);
            if (decoded.length < IV_LENGTH_BYTES + (TAG_LENGTH_BITS / 8)) {
                throw new IllegalArgumentException("Encrypted payload is corrupted or too short");
            }

            byte[] iv = Arrays.copyOfRange(decoded, 0, IV_LENGTH_BYTES);
            byte[] cipherText = Arrays.copyOfRange(decoded, IV_LENGTH_BYTES, decoded.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            return cipher.doFinal(cipherText);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to decrypt AES-GCM payload: authentication or key mismatch", e);
        }
    }
}

