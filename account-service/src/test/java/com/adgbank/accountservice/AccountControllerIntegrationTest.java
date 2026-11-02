package com.adgbank.accountservice;

import com.adgbank.accountservice.controller.AccountController;
import com.adgbank.accountservice.exception.AccountNotFoundException;
import com.adgbank.accountservice.exception.GlobalExceptionHandler;
import com.adgbank.accountservice.exception.InsufficientFundsException;
import com.adgbank.accountservice.service.AccountService;
import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateAccountRequest;
import com.adgbank.common.dto.UpdateBalanceRequest;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AccountController.class)
@Import(GlobalExceptionHandler.class)
class AccountControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AccountService accountService;

    @Test
    @DisplayName("POST /api/accounts - Returns 201 Created on valid account creation")
    void shouldCreateAccountSuccessfully() throws Exception {
        CreateAccountRequest request = new CreateAccountRequest(1L, "EUR", new BigDecimal("1250.50"));
        AccountDto createdDto = new AccountDto(10L, 1L, "40817810123456789012", new BigDecimal("1250.50"), "EUR", "ACTIVE", Instant.now());

        when(accountService.createAccount(any(CreateAccountRequest.class))).thenReturn(createdDto);

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.accountNumber").value("40817810123456789012"))
                .andExpect(jsonPath("$.currency").value("EUR"))
                .andExpect(jsonPath("$.balance").value(1250.50));
    }

    @Test
    @DisplayName("POST /api/accounts - Returns 400 Bad Request when currency is unsupported")
    void shouldRejectInvalidCurrency() throws Exception {
        CreateAccountRequest invalidRequest = new CreateAccountRequest(1L, "BITCOIN", new BigDecimal("100.00"));

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("POST /api/accounts - Returns 400 Bad Request when initial deposit is negative")
    void shouldRejectNegativeDeposit() throws Exception {
        CreateAccountRequest negativeRequest = new CreateAccountRequest(1L, "RUB", new BigDecimal("-50.00"));

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(negativeRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/accounts/{id} - Returns 200 OK when account exists")
    void shouldReturnAccountById() throws Exception {
        AccountDto sampleDto = new AccountDto(5L, 2L, "40817810999988887777", new BigDecimal("500.00"), "USD", "ACTIVE", Instant.now());
        when(accountService.getAccountById(5L)).thenReturn(sampleDto);

        mockMvc.perform(get("/api/accounts/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.balance").value(500.00));
    }

    @Test
    @DisplayName("GET /api/accounts/{id} - Returns 404 Not Found when account missing")
    void shouldReturn404WhenNotFound() throws Exception {
        when(accountService.getAccountById(999L)).thenThrow(new AccountNotFoundException("Account not found with id: 999"));

        mockMvc.perform(get("/api/accounts/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Account not found with id: 999"));
    }

    @Test
    @DisplayName("PUT /api/accounts/{id}/balance - Returns 400 Bad Request on insufficient funds")
    void shouldReturn400OnInsufficientFunds() throws Exception {
        UpdateBalanceRequest request = new UpdateBalanceRequest(new BigDecimal("9999.00"), "DEBIT", "REF_OVERDRAFT");
        when(accountService.updateBalance(eq(1L), any(UpdateBalanceRequest.class)))
                .thenThrow(new InsufficientFundsException("Insufficient funds on account"));

        mockMvc.perform(put("/api/accounts/1/balance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Insufficient funds on account"));
    }
}
