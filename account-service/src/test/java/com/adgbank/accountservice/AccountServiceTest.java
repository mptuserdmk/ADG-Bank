package com.adgbank.accountservice;

import com.adgbank.accountservice.entity.AccountEntity;
import com.adgbank.accountservice.exception.AccountNotFoundException;
import com.adgbank.accountservice.exception.InsufficientFundsException;
import com.adgbank.accountservice.repository.AccountRepository;
import com.adgbank.accountservice.service.AccountService;
import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateAccountRequest;
import com.adgbank.common.dto.UpdateBalanceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private AccountEntity sampleAccount;

    @BeforeEach
    void setUp() {
        sampleAccount = new AccountEntity(1L, "40817810123456789012", new BigDecimal("1000.00"), "RUB", "ACTIVE");
        sampleAccount.setId(10L);
    }

    @Test
    @DisplayName("Should create account with formatted 2-decimal balance")
    void shouldCreateAccount() {
        CreateAccountRequest request = new CreateAccountRequest(1L, "RUB", new BigDecimal("500.50"));
        when(accountRepository.existsByAccountNumber(anyString())).thenReturn(false);
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
    @DisplayName("Should debit funds when balance is sufficient")
    void shouldDebitBalanceSuccessfully() {
        when(accountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateBalanceRequest request = new UpdateBalanceRequest(new BigDecimal("300.00"), "DEBIT", "REF2");
        AccountDto updated = accountService.updateBalance(10L, request);

        assertThat(updated.balance()).isEqualByComparingTo(new BigDecimal("700.00"));
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

