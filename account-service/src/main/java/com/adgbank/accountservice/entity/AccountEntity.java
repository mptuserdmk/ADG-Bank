package com.adgbank.accountservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Entity
@Table(name = "accounts")
public class AccountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "account_number", nullable = false, unique = true, length = 34)
    private String accountNumber;

    @Column(nullable = false, precision = 24, scale = 8)
    private BigDecimal balance;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "pqc_key_id", length = 64)
    private String pqcKeyId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public AccountEntity() {}

    public AccountEntity(Long userId, String accountNumber, BigDecimal balance, String currency, String status) {
        this(userId, accountNumber, balance, currency, status, null);
    }

    public AccountEntity(Long userId, String accountNumber, BigDecimal balance, String currency, String status, String pqcKeyId) {
        this.userId = userId;
        this.accountNumber = accountNumber;
        this.currency = currency != null ? currency.toUpperCase() : "EUR";
        this.balance = scaleAmount(balance, this.currency);
        this.status = status;
        this.pqcKeyId = pqcKeyId;
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
        this.balance = scaleAmount(this.balance, this.currency);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = scaleAmount(balance, this.currency);
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPqcKeyId() {
        return pqcKeyId;
    }

    public void setPqcKeyId(String pqcKeyId) {
        this.pqcKeyId = pqcKeyId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
