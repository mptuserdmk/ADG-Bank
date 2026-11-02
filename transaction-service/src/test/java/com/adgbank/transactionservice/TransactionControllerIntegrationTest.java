package com.adgbank.transactionservice;

import com.adgbank.common.dto.CreateTransactionRequest;
import com.adgbank.common.dto.TransactionDto;
import com.adgbank.transactionservice.controller.TransactionController;
import com.adgbank.transactionservice.exception.GlobalExceptionHandler;
import com.adgbank.transactionservice.exception.TransactionNotFoundException;
import com.adgbank.transactionservice.exception.TransferExecutionException;
import com.adgbank.transactionservice.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TransactionController.class)
@Import(GlobalExceptionHandler.class)
class TransactionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionService transactionService;

    @Test
    @DisplayName("POST /api/transactions - Returns 201 Created and passes X-Idempotency-Key")
    void shouldCreateTransactionWithIdempotencyKey() throws Exception {
        String key = "test-idem-uuid-999";
        CreateTransactionRequest request = new CreateTransactionRequest(10L, 20L, new BigDecimal("250.00"), "Rent payment");
        TransactionDto successDto = new TransactionDto(
                101L,
                key,
                10L,
                20L,
                new BigDecimal("250.00"),
                "EUR",
                "SUCCESS",
                "Rent payment",
                Instant.now()
        );

        when(transactionService.executeTransfer(any(CreateTransactionRequest.class), eq(key))).thenReturn(successDto);

        mockMvc.perform(post("/api/transactions")
                        .header("X-Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.idempotencyKey").value(key))
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.amount").value(250.00));

        verify(transactionService).executeTransfer(any(CreateTransactionRequest.class), eq(key));
    }

    @Test
    @DisplayName("POST /api/transactions - Returns 202 Accepted when Circuit Breaker returns PENDING_FALLBACK")
    void shouldReturnAcceptedOnCircuitBreakerFallback() throws Exception {
        String key = "test-idem-fallback";
        CreateTransactionRequest request = new CreateTransactionRequest(10L, 20L, new BigDecimal("100.00"), "Deferred");
        TransactionDto fallbackDto = new TransactionDto(
                102L,
                key,
                10L,
                20L,
                new BigDecimal("100.00"),
                "EUR",
                "PENDING_FALLBACK",
                "Circuit Breaker active: deferred",
                Instant.now()
        );

        when(transactionService.executeTransfer(any(CreateTransactionRequest.class), eq(key))).thenReturn(fallbackDto);

        mockMvc.perform(post("/api/transactions")
                        .header("X-Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("PENDING_FALLBACK"));
    }

    @Test
    @DisplayName("POST /api/transactions - Returns 400 Bad Request when amount is 0.00")
    void shouldRejectZeroAmountTransfer() throws Exception {
        CreateTransactionRequest invalidRequest = new CreateTransactionRequest(10L, 20L, new BigDecimal("0.00"), "Zero transfer");

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /api/transactions - Returns 422 Unprocessable Entity when transfer execution fails")
    void shouldReturn422WhenTransferFails() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest(10L, 20L, new BigDecimal("500.00"), "Payment");
        when(transactionService.executeTransfer(any(CreateTransactionRequest.class), any()))
                .thenThrow(new TransferExecutionException("Transfer failed during credit step"));

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.error").value("TRANSFER_FAILED"))
                .andExpect(jsonPath("$.message").value("Transfer failed during credit step"));
    }

    @Test
    @DisplayName("GET /api/transactions/{id} - Returns 404 Not Found when transaction does not exist")
    void shouldReturn404WhenTransactionMissing() throws Exception {
        when(transactionService.getTransactionById(888L)).thenThrow(new TransactionNotFoundException("Transaction not found with id: 888"));

        mockMvc.perform(get("/api/transactions/888"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Transaction not found with id: 888"));
    }
}
