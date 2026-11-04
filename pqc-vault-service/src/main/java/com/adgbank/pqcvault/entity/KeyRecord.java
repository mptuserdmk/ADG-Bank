package com.adgbank.pqcvault.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Persisted key record containing CRYSTALS-Dilithium3 public and encrypted private key pairs.
 * Notice: publicKey and encryptedPrivateKey are strictly mapped to database TEXT columns
 * because Dilithium3 keys exceed 2000-5000 characters in Base64 encoding.
 */
@Entity
@Table(name = "key_records", indexes = {
        @Index(name = "idx_key_account_id", columnList = "accountId")
})
public class KeyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false, length = 64)
    private String algorithm = "CRYSTALS-Dilithium3";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String publicKey;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String encryptedPrivateKey;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public KeyRecord() {
    }

    public KeyRecord(String accountId, String algorithm, String publicKey, String encryptedPrivateKey) {
        this.accountId = accountId;
        this.algorithm = algorithm;
        this.publicKey = publicKey;
        this.encryptedPrivateKey = encryptedPrivateKey;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getEncryptedPrivateKey() {
        return encryptedPrivateKey;
    }

    public void setEncryptedPrivateKey(String encryptedPrivateKey) {
        this.encryptedPrivateKey = encryptedPrivateKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        KeyRecord keyRecord = (KeyRecord) o;
        return Objects.equals(id, keyRecord.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

