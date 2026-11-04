package com.adgbank.accountservice;

import com.adgbank.accountservice.client.PqcVaultClient;
import com.adgbank.accountservice.entity.AccountEntity;
import com.adgbank.accountservice.exception.AccountNotFoundException;
import com.adgbank.accountservice.exception.InsufficientFundsException;
import com.adgbank.accountservice.exception.InvalidQuantumSignatureException;
import com.adgbank.accountservice.repository.AccountRepository;
import com.adgbank.accountservice.service.AccountService;
import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateAccountRequest;
import com.adgbank.common.dto.PqcGenerateKeyRequest;
import com.adgbank.common.dto.PqcKeyResponse;
import com.adgbank.common.dto.PqcVerifyRequest;
import com.adgbank.common.dto.PqcVerifyResponse;
import com.adgbank.common.dto.UpdateBalanceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PqcVaultClient pqcVaultClient;

    @InjectMocks
    private AccountService accountService;

    private AccountEntity sampleAccount;
    private final UUID sampleKeyId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        sampleAccount = new AccountEntity(1L, "40817810123456789012", new BigDecimal("1000.00"), "RUB", "ACTIVE", sampleKeyId.toString());
        sampleAccount.setId(10L);
    }

    @Test
    @DisplayName("Should create account with formatted 2-decimal balance and PQC key")
    void shouldCreateAccount() {
        CreateAccountRequest request = new CreateAccountRequest(1L, "RUB", new BigDecimal("500.50"));
        when(accountRepository.existsByAccountNumber(anyString())).thenReturn(false);
        when(pqcVaultClient.generateKey(any(PqcGenerateKeyRequest.class)))
                .thenReturn(new PqcKeyResponse(sampleKeyId, "ACC123", "CRYSTALS-Dilithium3", "pubkeyBase64", Instant.now()));
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(invocation -> {
            AccountEntity saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        AccountDto created = accountService.createAccount(request);

        assertThat(created).isNotNull();
        assertThat(created.balance()).isEqualByComparingTo(new BigDecimal("500.50"));
        assertThat(created.currency()).isEqualTo("RUB");
        assertThat(created.status()).isEqualTo("ACTIVE");
        assertThat(created.pqcKeyId()).isEqualTo(sampleKeyId.toString());
    }

    @Test
    @DisplayName("Should create crypto BTC account with 8-decimal precision")
    void shouldCreateBtcAccountWith8Decimals() {
        CreateAccountRequest request = new CreateAccountRequest(1L, "BTC", new BigDecimal("0.12345678"));
        when(accountRepository.existsByAccountNumber(anyString())).thenReturn(false);
        when(pqcVaultClient.generateKey(any(PqcGenerateKeyRequest.class)))
                .thenReturn(new PqcKeyResponse(sampleKeyId, "ACC-BTC", "CRYSTALS-Dilithium3", "pubkey", Instant.now()));
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(invocation -> {
            AccountEntity saved = invocation.getArgument(0);
            saved.setId(101L);
            return saved;
        });

        AccountDto created = accountService.createAccount(request);

        assertThat(created).isNotNull();
        assertThat(created.balance()).isEqualByComparingTo(new BigDecimal("0.12345678"));
        assertThat(created.currency()).isEqualTo("BTC");
        assertThat(created.pqcKeyId()).isEqualTo(sampleKeyId.toString());
    }

    @Test
    @DisplayName("Should credit funds and increase balance correctly")
    void shouldCreditBalance() {
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateBalanceRequest request = new UpdateBalanceRequest(new BigDecimal("250.00"), "CREDIT", "REF1");
        AccountDto updated = accountService.updateBalance(10L, request);

        assertThat(updated.balance()).isEqualByComparingTo(new BigDecimal("1250.00"));
    }

    @Test
    @DisplayName("Should debit funds when balance is sufficient and verify PQC signature")
    void shouldDebitBalanceSuccessfullyWithPqcSignature() {
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(pqcVaultClient.verify(any(PqcVerifyRequest.class)))
                .thenReturn(new PqcVerifyResponse(true, "Signature is valid", "CRYSTALS-Dilithium3"));
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateBalanceRequest request = new UpdateBalanceRequest(
                new BigDecimal("300.00"),
                "DEBIT",
                "REF2",
                "valid-dilithium-sig",
                "canonical-payload"
        );
        AccountDto updated = accountService.updateBalance(10L, request);

        assertThat(updated.balance()).isEqualByComparingTo(new BigDecimal("700.00"));
        verify(pqcVaultClient).verify(any(PqcVerifyRequest.class));
    }

    @Test
    @DisplayName("Should throw InvalidQuantumSignatureException when PQC signature is rejected")
    void shouldRejectDebitWhenPqcSignatureFails() {
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(pqcVaultClient.verify(any(PqcVerifyRequest.class)))
                .thenReturn(new PqcVerifyResponse(false, "Invalid signature bytes", "CRYSTALS-Dilithium3"));

        UpdateBalanceRequest request = new UpdateBalanceRequest(
                new BigDecimal("300.00"),
                "DEBIT",
                "REF2",
                "invalid-sig",
                "canonical-payload"
        );

        assertThatThrownBy(() -> accountService.updateBalance(10L, request))
                .isInstanceOf(InvalidQuantumSignatureException.class)
                .hasMessageContaining("PQC signature verification rejected");

        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw InsufficientFundsException when debit exceeds balance")
    void shouldThrowWhenInsufficientFunds() {
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));

        UpdateBalanceRequest request = new UpdateBalanceRequest(new BigDecimal("5000.00"), "DEBIT", "REF3");

        assertThatThrownBy(() -> accountService.updateBalance(10L, request))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessageContaining("Insufficient funds");

        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalStateException when account is FROZEN")
    void shouldThrowWhenAccountNotActive() {
        sampleAccount.setStatus("FROZEN");
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));

        UpdateBalanceRequest request = new UpdateBalanceRequest(new BigDecimal("100.00"), "CREDIT", "REF_FROZEN");

        assertThatThrownBy(() -> accountService.updateBalance(10L, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("is not active");

        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when operation type is unsupported")
    void shouldThrowWhenOperationTypeUnsupported() {
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));

        UpdateBalanceRequest request = new UpdateBalanceRequest(new BigDecimal("100.00"), "UNKNOWN_OP", "REF_UNKNOWN");

        assertThatThrownBy(() -> accountService.updateBalance(10L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported operation type");

        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw AccountNotFoundException when account does not exist")
    void shouldThrowWhenAccountNotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccountById(999L))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessageContaining("Account not found with id: 999");
    }
}
