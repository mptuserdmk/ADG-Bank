package com.adgbank.transactionservice;

import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateTransactionRequest;
import com.adgbank.common.dto.TransactionDto;
import com.adgbank.common.dto.UpdateBalanceRequest;
import com.adgbank.transactionservice.client.AccountClient;
import com.adgbank.transactionservice.entity.TransactionEntity;
import com.adgbank.transactionservice.repository.TransactionRepository;
import com.adgbank.transactionservice.service.TransactionService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountClient accountClient;

    @InjectMocks
    private TransactionService transactionService;

    private CreateTransactionRequest transferRequest;

    @BeforeEach
    void setUp() {
        transferRequest = new CreateTransactionRequest(10L, 20L, new BigDecimal("500.00"), "Payment for services");
    }

    @Test
    @DisplayName("Should return existing transaction when idempotent key repeats")
    void shouldReturnExistingWhenIdempotencyKeyRepeats() {
        String key = "idem-key-12345";
        TransactionEntity existing = new TransactionEntity(key, 10L, 20L, new BigDecimal("500.00"), "RUB", "SUCCESS", "Original");
        existing.setId(99L);

        when(transactionRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(existing));

        TransactionDto result = transactionService.executeTransfer(transferRequest, key);

        assertThat(result.id()).isEqualTo(99L);
        assertThat(result.status()).isEqualTo("SUCCESS");
        verifyNoInteractions(accountClient);
    }

    @Test
    @DisplayName("Should execute transfer with debit and credit on account service")
    void shouldExecuteTransferSuccessfully() {
        String key = "idem-key-new";
        when(transactionRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());

        AccountDto sourceAcc = new AccountDto(10L, 1L, "408178101", new BigDecimal("1000.00"), "RUB", "ACTIVE", Instant.now());
        AccountDto targetAcc = new AccountDto(20L, 2L, "408178102", new BigDecimal("200.00"), "RUB", "ACTIVE", Instant.now());

        when(accountClient.getAccountById(10L)).thenReturn(sourceAcc);
        when(accountClient.getAccountById(20L)).thenReturn(targetAcc);

        when(transactionRepository.save(any(TransactionEntity.class))).thenAnswer(invocation -> {
            TransactionEntity entity = invocation.getArgument(0);
            entity.setId(101L);
            return entity;
        });

        TransactionDto result = transactionService.executeTransfer(transferRequest, key);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("SUCCESS");
        assertThat(result.amount()).isEqualByComparingTo(new BigDecimal("500.00"));

        verify(accountClient, times(1)).updateBalance(eq(10L), any(UpdateBalanceRequest.class));
        verify(accountClient, times(1)).updateBalance(eq(20L), any(UpdateBalanceRequest.class));
    }

    @Test
    @DisplayName("Should fail when source and target accounts are identical")
    void shouldRejectSelfTransfer() {
        CreateTransactionRequest selfTransfer = new CreateTransactionRequest(10L, 10L, new BigDecimal("100.00"), "Self");

        assertThatThrownBy(() -> transactionService.executeTransfer(selfTransfer, "key-self"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Source and target accounts must be different");

        verifyNoInteractions(accountClient);
    }

    @Test
    @DisplayName("Fallback method should persist PENDING_FALLBACK transaction when Circuit Breaker trips")
    void shouldHandleCircuitBreakerFallback() {
        RuntimeException ex = new RuntimeException("Connection timed out to account-service");
        String key = "fallback-key";

        when(transactionRepository.save(any(TransactionEntity.class))).thenAnswer(invocation -> {
            TransactionEntity entity = invocation.getArgument(0);
            entity.setId(555L);
            return entity;
        });

        TransactionDto fallbackResult = transactionService.executeTransferFallback(transferRequest, key, ex);

        assertThat(fallbackResult).isNotNull();
        assertThat(fallbackResult.status()).isEqualTo("PENDING_FALLBACK");
        assertThat(fallbackResult.description()).contains("Circuit Breaker active");
    }
}

