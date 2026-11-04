package com.adgbank.transactionservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idempotency_key", unique = true, length = 64)
    private String idempotencyKey;

    @Column(name = "source_account_id", nullable = false)
    private Long sourceAccountId;

    @Column(name = "target_account_id", nullable = false)
    private Long targetAccountId;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "target_amount", precision = 24, scale = 8)
    private BigDecimal targetAmount;

    @Column(name = "target_currency", length = 10)
    private String targetCurrency;

    @Column(name = "exchange_rate", precision = 24, scale = 8)
    private BigDecimal exchangeRate;

    @Column(name = "pqc_signature", columnDefinition = "TEXT")
    private String pqcSignature;

    @Column(name = "canonical_payload", columnDefinition = "TEXT")
    private String canonicalPayload;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public TransactionEntity() {}

    public TransactionEntity(String idempotencyKey, Long sourceAccountId, Long targetAccountId,
                             BigDecimal amount, String currency, String status, String description) {
        this(idempotencyKey, sourceAccountId, targetAccountId, amount, currency,
                amount, currency, BigDecimal.ONE, null, null, status, description);
    }

    public TransactionEntity(String idempotencyKey, Long sourceAccountId, Long targetAccountId,
                             BigDecimal amount, String currency,
                             BigDecimal targetAmount, String targetCurrency, BigDecimal exchangeRate,
                             String pqcSignature, String canonicalPayload,
                             String status, String description) {
        this.idempotencyKey = idempotencyKey;
        this.sourceAccountId = sourceAccountId;
        this.targetAccountId = targetAccountId;
        this.currency = currency != null ? currency.toUpperCase() : "RUB";
        this.amount = scaleAmount(amount, this.currency);
        this.targetCurrency = targetCurrency != null ? targetCurrency.toUpperCase() : this.currency;
        this.targetAmount = scaleAmount(targetAmount, this.targetCurrency);
        this.exchangeRate = exchangeRate != null ? exchangeRate.setScale(8, RoundingMode.HALF_EVEN) : BigDecimal.ONE.setScale(8, RoundingMode.HALF_EVEN);
        this.pqcSignature = pqcSignature;
        this.canonicalPayload = canonicalPayload;
        this.status = status;
        this.description = description;
        this.createdAt = Instant.now();
    }

    public static BigDecimal scaleAmount(BigDecimal amount, String currency) {
        int scale = "BTC".equalsIgnoreCase(currency) ? 8 : 2;
        if (amount == null) {
            return BigDecimal.ZERO.setScale(scale, RoundingMode.HALF_EVEN);
        }
        return amount.setScale(scale, RoundingMode.HALF_EVEN);
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        this.amount = scaleAmount(this.amount, this.currency);
        this.targetAmount = scaleAmount(this.targetAmount, this.targetCurrency);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public Long getSourceAccountId() {
        return sourceAccountId;
    }

    public void setSourceAccountId(Long sourceAccountId) {
        this.sourceAccountId = sourceAccountId;
    }

    public Long getTargetAccountId() {
        return targetAccountId;
    }

    public void setTargetAccountId(Long targetAccountId) {
        this.targetAccountId = targetAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = scaleAmount(amount, this.currency);
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = scaleAmount(targetAmount, this.targetCurrency);
    }

    public String getTargetCurrency() {
        return targetCurrency;
    }

    public void setTargetCurrency(String targetCurrency) {
        this.targetCurrency = targetCurrency;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate != null ? exchangeRate.setScale(8, RoundingMode.HALF_EVEN) : BigDecimal.ONE.setScale(8, RoundingMode.HALF_EVEN);
    }

    public String getPqcSignature() {
        return pqcSignature;
    }

    public void setPqcSignature(String pqcSignature) {
        this.pqcSignature = pqcSignature;
    }

    public String getCanonicalPayload() {
        return canonicalPayload;
    }

    public void setCanonicalPayload(String canonicalPayload) {
        this.canonicalPayload = canonicalPayload;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
