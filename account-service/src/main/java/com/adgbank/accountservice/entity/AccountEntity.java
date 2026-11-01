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

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public AccountEntity() {}

    public AccountEntity(Long userId, String accountNumber, BigDecimal balance, String currency, String status) {
        this.userId = userId;
        this.accountNumber = accountNumber;
        this.balance = balance != null ? balance.setScale(2, RoundingMode.HALF_EVEN) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
        this.currency = currency;
        this.status = status;
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.balance == null) {
            this.balance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
        } else {
            this.balance = this.balance.setScale(2, RoundingMode.HALF_EVEN);
        }
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
        this.balance = balance != null ? balance.setScale(2, RoundingMode.HALF_EVEN) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_EVEN);
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

