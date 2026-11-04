package com.adgbank.transactionservice;

import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateTransactionRequest;
import com.adgbank.common.dto.MarketConversionResponse;
import com.adgbank.common.dto.PqcSignRequest;
import com.adgbank.common.dto.PqcSignResponse;
import com.adgbank.common.dto.TransactionDto;
import com.adgbank.common.dto.UpdateBalanceRequest;
import com.adgbank.transactionservice.client.AccountClient;
import com.adgbank.transactionservice.client.MarketRateClient;
import com.adgbank.transactionservice.client.PqcVaultClient;
import com.adgbank.transactionservice.entity.TransactionEntity;
import com.adgbank.transactionservice.exception.TransferExecutionException;
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
import java.util.UUID;

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

    @Mock
    private MarketRateClient marketRateClient;

    @Mock
    private PqcVaultClient pqcVaultClient;

    @InjectMocks
    private TransactionService transactionService;

    private CreateTransactionRequest transferRequest;
    private final UUID sampleKeyId = UUID.randomUUID();

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
    @DisplayName("Should execute same-currency transfer with PQC Dilithium3 signing")
    void shouldExecuteTransferSuccessfullyWithPqcSignature() {
        String key = "idem-key-new";
        when(transactionRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());

        AccountDto sourceAcc = new AccountDto(10L, 1L, "408178101", new BigDecimal("1000.00"), "RUB", "ACTIVE", Instant.now(), sampleKeyId.toString());
        AccountDto targetAcc = new AccountDto(20L, 2L, "408178102", new BigDecimal("200.00"), "RUB", "ACTIVE", Instant.now(), null);

        when(accountClient.getAccountById(10L)).thenReturn(sourceAcc);
        when(accountClient.getAccountById(20L)).thenReturn(targetAcc);
        when(pqcVaultClient.sign(any(PqcSignRequest.class)))
                .thenReturn(new PqcSignResponse(sampleKeyId, "CRYSTALS-Dilithium3", "pqc-signature-base64-bytes"));

        when(transactionRepository.save(any(TransactionEntity.class))).thenAnswer(invocation -> {
            TransactionEntity entity = invocation.getArgument(0);
            entity.setId(101L);
            return entity;
        });

        TransactionDto result = transactionService.executeTransfer(transferRequest, key);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("SUCCESS");
        assertThat(result.amount()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(result.pqcSignature()).isEqualTo("pqc-signature-base64-bytes");

        // Verify PQC sign was invoked
        verify(pqcVaultClient).sign(any(PqcSignRequest.class));

        // Verify debit included the PQC signature
        verify(accountClient, times(1)).updateBalance(eq(10L), argThat(r ->
                "DEBIT".equals(r.operationType()) && "pqc-signature-base64-bytes".equals(r.pqcSignature())
        ));
        verify(accountClient, times(1)).updateBalance(eq(20L), argThat(r ->
                "CREDIT".equals(r.operationType())
        ));
    }

    @Test
    @DisplayName("Should execute multi-currency transfer with MarketRate conversion")
    void shouldExecuteMultiCurrencyTransferSuccessfully() {
        String key = "idem-multicurrency";
        CreateTransactionRequest cryptoRequest = new CreateTransactionRequest(10L, 20L, new BigDecimal("0.50000000"), "BTC to USDT");

        when(transactionRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());

        AccountDto btcAcc = new AccountDto(10L, 1L, "408170011", new BigDecimal("2.00000000"), "BTC", "ACTIVE", Instant.now(), sampleKeyId.toString());
        AccountDto usdtAcc = new AccountDto(20L, 2L, "408170021", new BigDecimal("100.00"), "USDT", "ACTIVE", Instant.now(), null);

        when(accountClient.getAccountById(10L)).thenReturn(btcAcc);
        when(accountClient.getAccountById(20L)).thenReturn(usdtAcc);

        // Mock market rate conversion: 0.5 BTC * 68500 = 34250.00 USDT
        when(marketRateClient.convert("BTC", "USDT", new BigDecimal("0.50000000")))
                .thenReturn(new MarketConversionResponse(
                        "BTC", "USDT",
                        new BigDecimal("0.50000000"),
                        new BigDecimal("68500.00000000"),
                        new BigDecimal("34250.00"),
                        Instant.now()
                ));

        when(pqcVaultClient.sign(any(PqcSignRequest.class)))
                .thenReturn(new PqcSignResponse(sampleKeyId, "CRYSTALS-Dilithium3", "pqc-sig"));

        when(transactionRepository.save(any(TransactionEntity.class))).thenAnswer(invocation -> {
            TransactionEntity entity = invocation.getArgument(0);
            entity.setId(102L);
            return entity;
        });

        TransactionDto result = transactionService.executeTransfer(cryptoRequest, key);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("SUCCESS");
        assertThat(result.amount()).isEqualByComparingTo(new BigDecimal("0.50000000"));
        assertThat(result.targetAmount()).isEqualByComparingTo(new BigDecimal("34250.00"));
        assertThat(result.targetCurrency()).isEqualTo("USDT");
        assertThat(result.exchangeRate()).isEqualByComparingTo(new BigDecimal("68500.00000000"));

        verify(marketRateClient).convert("BTC", "USDT", new BigDecimal("0.50000000"));
        verify(accountClient).updateBalance(eq(10L), argThat(r -> "DEBIT".equals(r.operationType()) && r.amount().compareTo(new BigDecimal("0.50000000")) == 0));
        verify(accountClient).updateBalance(eq(20L), argThat(r -> "CREDIT".equals(r.operationType()) && r.amount().compareTo(new BigDecimal("34250.00")) == 0));
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

    @Test
    @DisplayName("Should trigger compensatory credit on source account when target credit fails")
    void shouldTriggerCompensatoryCreditWhenTargetCreditFails() {
        String key = "idem-compensation-test";
        AccountDto sourceAcc = new AccountDto(10L, 1L, "408178101", new BigDecimal("1000.00"), "RUB", "ACTIVE", Instant.now(), null);
        AccountDto targetAcc = new AccountDto(20L, 2L, "408178102", new BigDecimal("200.00"), "RUB", "ACTIVE", Instant.now(), null);

        when(transactionRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(accountClient.getAccountById(10L)).thenReturn(sourceAcc);
        when(accountClient.getAccountById(20L)).thenReturn(targetAcc);

        // Debit source succeeds
        doAnswer(inv -> null).when(accountClient).updateBalance(eq(10L), argThat(r -> "DEBIT".equals(r.operationType())));

        // Credit target fails with exception
        doThrow(new RuntimeException("Database timeout on target account"))
                .when(accountClient).updateBalance(eq(20L), argThat(r -> "CREDIT".equals(r.operationType())));

        assertThatThrownBy(() -> transactionService.executeTransfer(transferRequest, key))
                .isInstanceOf(TransferExecutionException.class)
                .hasMessageContaining("Transfer failed during credit step");

        // Verify compensatory credit was sent to source account with REVERSAL- prefix
        verify(accountClient, times(1)).updateBalance(eq(10L), argThat(r ->
                "CREDIT".equals(r.operationType()) && r.referenceId().startsWith("REVERSAL-idem-compensation-test")
        ));
    }

    @Test
    @DisplayName("Should fail when source or target account is not found in account-service")
    void shouldFailWhenAccountNotFound() {
        String key = "idem-missing-acc";
        when(transactionRepository.findByIdempotencyKey(key)).thenReturn(Optional.empty());
        when(accountClient.getAccountById(10L)).thenReturn(null);

        assertThatThrownBy(() -> transactionService.executeTransfer(transferRequest, key))
                .isInstanceOf(TransferExecutionException.class)
                .hasMessageContaining("One or both accounts could not be retrieved");

        verify(accountClient, never()).updateBalance(anyLong(), any());
    }
}
