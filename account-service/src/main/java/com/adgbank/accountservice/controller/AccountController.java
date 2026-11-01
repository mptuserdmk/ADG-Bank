package com.adgbank.accountservice.controller;

import com.adgbank.accountservice.service.AccountService;
import com.adgbank.common.dto.AccountDto;
import com.adgbank.common.dto.CreateAccountRequest;
import com.adgbank.common.dto.UpdateBalanceRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Accounts", description = "Bank accounts and balance operations")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    @Operation(summary = "Open a new bank account", description = "Creates a new bank account with initial balance for a user")
    public ResponseEntity<AccountDto> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        AccountDto created = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "List all accounts", description = "Retrieves all accounts across the bank")
    public ResponseEntity<List<AccountDto>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID", description = "Retrieves account details by its ID")
    public ResponseEntity<AccountDto> getAccountById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get accounts by User ID", description = "Retrieves all accounts belonging to a specific customer")
    public ResponseEntity<List<AccountDto>> getAccountsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(accountService.getAccountsByUserId(userId));
    }

    @GetMapping("/by-number/{accountNumber}")
    @Operation(summary = "Get account by account number", description = "Retrieves account by its 20-digit number")
    public ResponseEntity<AccountDto> getAccountByNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getAccountByNumber(accountNumber));
    }

    @PutMapping("/{id}/balance")
    @Operation(summary = "Update account balance", description = "Debits or credits an account balance with monetary validation")
    public ResponseEntity<AccountDto> updateBalance(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBalanceRequest request
    ) {
        AccountDto updated = accountService.updateBalance(id, request);
        return ResponseEntity.ok(updated);
    }
}

