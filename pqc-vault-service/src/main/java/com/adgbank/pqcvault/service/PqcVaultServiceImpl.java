package com.adgbank.pqcvault.service;

import com.adgbank.pqcvault.crypto.AesGcmCipher;
import com.adgbank.pqcvault.crypto.PqcDilithiumEngine;
import com.adgbank.pqcvault.dto.GenerateKeyRequest;
import com.adgbank.pqcvault.dto.KeyResponse;
import com.adgbank.pqcvault.dto.SignRequest;
import com.adgbank.pqcvault.dto.SignResponse;
import com.adgbank.pqcvault.dto.VerifyRequest;
import com.adgbank.pqcvault.dto.VerifyResponse;
import com.adgbank.pqcvault.entity.KeyRecord;
import com.adgbank.pqcvault.exception.CryptoOperationException;
import com.adgbank.pqcvault.exception.KeyNotFoundException;
import com.adgbank.pqcvault.repository.KeyRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Service
@Transactional
public class PqcVaultServiceImpl implements PqcVaultService {

    private static final Logger log = LoggerFactory.getLogger(PqcVaultServiceImpl.class);

    private final KeyRecordRepository keyRecordRepository;
    private final PqcDilithiumEngine dilithiumEngine;
    private final AesGcmCipher aesGcmCipher;

    public PqcVaultServiceImpl(
            KeyRecordRepository keyRecordRepository,
            PqcDilithiumEngine dilithiumEngine,
            AesGcmCipher aesGcmCipher
    ) {
        this.keyRecordRepository = keyRecordRepository;
        this.dilithiumEngine = dilithiumEngine;
        this.aesGcmCipher = aesGcmCipher;
    }

    @Override
    public KeyResponse generateKeyPair(GenerateKeyRequest request) {
        log.info("Generating new CRYSTALS-Dilithium3 keypair for account: {}", request.accountId());

        try {
            PqcDilithiumEngine.RawDilithiumKeyPair keyPair = dilithiumEngine.generateKeyPair();

            String base64PublicKey = Base64.getEncoder().encodeToString(keyPair.publicKeyBytes());
            String encryptedPrivateKey = aesGcmCipher.encrypt(keyPair.privateKeyBytes());

            KeyRecord keyRecord = new KeyRecord(
                    request.accountId(),
                    PqcDilithiumEngine.ALGORITHM_NAME,
                    base64PublicKey,
                    encryptedPrivateKey
            );

            KeyRecord saved = keyRecordRepository.save(keyRecord);
            log.info("Saved Dilithium3 KeyRecord id={} for account={}", saved.getId(), request.accountId());

            return toKeyResponse(saved);
        } catch (Exception e) {
            log.error("Failed to generate and store Dilithium3 keypair for account {}: {}", request.accountId(), e.getMessage(), e);
            throw new CryptoOperationException("Dilithium3 keypair generation failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SignResponse sign(SignRequest request) {
        log.info("Signing canonical payload with KeyRecord id={}", request.keyId());

        KeyRecord keyRecord = keyRecordRepository.findById(request.keyId())
                .orElseThrow(() -> new KeyNotFoundException(request.keyId()));

        try {
            byte[] decryptedPrivateKey = aesGcmCipher.decrypt(keyRecord.getEncryptedPrivateKey());
            byte[] messageBytes = request.data().getBytes(StandardCharsets.UTF_8);

            byte[] signatureBytes = dilithiumEngine.sign(decryptedPrivateKey, messageBytes);
            String base64Signature = Base64.getEncoder().encodeToString(signatureBytes);

            log.info("Successfully produced Dilithium3 signature for keyId={}", request.keyId());
            return new SignResponse(request.keyId(), PqcDilithiumEngine.ALGORITHM_NAME, base64Signature);
        } catch (Exception e) {
            log.error("Failed to sign payload using keyId {}: {}", request.keyId(), e.getMessage(), e);
            throw new CryptoOperationException("Dilithium3 signing failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public VerifyResponse verify(VerifyRequest request) {
        String base64PublicKey = request.publicKey();

        if (base64PublicKey == null || base64PublicKey.isBlank()) {
            if (request.keyId() == null) {
                throw new IllegalArgumentException("Either keyId or publicKey must be provided for verification");
            }
            KeyRecord keyRecord = keyRecordRepository.findById(request.keyId())
                    .orElseThrow(() -> new KeyNotFoundException(request.keyId()));
            base64PublicKey = keyRecord.getPublicKey();
        }

        try {
            byte[] publicKeyBytes = Base64.getDecoder().decode(base64PublicKey);
            byte[] signatureBytes = Base64.getDecoder().decode(request.signature());
            byte[] messageBytes = request.data().getBytes(StandardCharsets.UTF_8);

            boolean valid = dilithiumEngine.verify(publicKeyBytes, messageBytes, signatureBytes);

            if (valid) {
                return new VerifyResponse(true, "CRYSTALS-Dilithium3 signature is valid", PqcDilithiumEngine.ALGORITHM_NAME);
            } else {
                return new VerifyResponse(false, "Invalid signature or tampered data payload", PqcDilithiumEngine.ALGORITHM_NAME);
            }
        } catch (Exception e) {
            log.warn("Dilithium3 signature verification exception: {}", e.getMessage());
            return new VerifyResponse(false, "Verification error: " + e.getMessage(), PqcDilithiumEngine.ALGORITHM_NAME);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public KeyResponse getKey(UUID keyId) {
        KeyRecord record = keyRecordRepository.findById(keyId)
                .orElseThrow(() -> new KeyNotFoundException(keyId));
        return toKeyResponse(record);
    }

    @Override
    @Transactional(readOnly = true)
    public KeyResponse getLatestKeyForAccount(String accountId) {
        KeyRecord record = keyRecordRepository.findTopByAccountIdOrderByCreatedAtDesc(accountId)
                .orElseThrow(() -> new KeyNotFoundException("No PQC keys found for account: " + accountId));
        return toKeyResponse(record);
    }

    private KeyResponse toKeyResponse(KeyRecord record) {
        return new KeyResponse(
                record.getId(),
                record.getAccountId(),
                record.getAlgorithm(),
                record.getPublicKey(),
                record.getCreatedAt()
        );
    }
}

