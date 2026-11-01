package com.adgbank.transactionservice.controller;

import com.adgbank.common.dto.CreateTransactionRequest;
import com.adgbank.common.dto.TransactionDto;
import com.adgbank.transactionservice.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions", description = "Money transfer operations with idempotency and Circuit Breaker")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @Operation(summary = "Execute money transfer", description = "Executes transfer between two bank accounts protected by idempotency and Circuit Breaker")
    public ResponseEntity<TransactionDto> createTransaction(
            @Valid @RequestBody CreateTransactionRequest request,
            @Parameter(description = "Optional idempotency key to prevent duplicate charges")
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey
    ) {
        TransactionDto result = transactionService.executeTransfer(request, idempotencyKey);
        HttpStatus status = "SUCCESS".equalsIgnoreCase(result.status()) ? HttpStatus.CREATED : HttpStatus.ACCEPTED;
        return ResponseEntity.status(status).body(result);
    }

    @GetMapping
    @Operation(summary = "List all transactions", description = "Retrieves ledger of all transactions in the system")
    public ResponseEntity<List<TransactionDto>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID", description = "Retrieves transaction details by ID")
    public ResponseEntity<TransactionDto> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @GetMapping("/account/{accountId}")
    @Operation(summary = "Get transactions for account", description = "Retrieves all debit and credit transactions for a specific account")
    public ResponseEntity<List<TransactionDto>> getTransactionsByAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getTransactionsByAccount(accountId));
    }
}

