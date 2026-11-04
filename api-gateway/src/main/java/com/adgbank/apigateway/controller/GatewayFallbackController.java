package com.adgbank.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class GatewayFallbackController {

    @RequestMapping("/users")
    public Mono<ResponseEntity<Map<String, Object>>> usersFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Service Unavailable",
                "message", "User Service is currently unreachable. Gateway Circuit Breaker engaged.",
                "service", "user-service",
                "timestamp", Instant.now().toString()
        )));
    }

    @RequestMapping("/accounts")
    public Mono<ResponseEntity<Map<String, Object>>> accountsFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Service Unavailable",
                "message", "Account Service is currently unreachable. Gateway Circuit Breaker engaged.",
                "service", "account-service",
                "timestamp", Instant.now().toString()
        )));
    }

    @RequestMapping("/transactions")
    public Mono<ResponseEntity<Map<String, Object>>> transactionsFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Service Unavailable",
                "message", "Transaction Service is currently unreachable. Gateway Circuit Breaker engaged.",
                "service", "transaction-service",
                "timestamp", Instant.now().toString()
        )));
    }

    @RequestMapping("/vault")
    public Mono<ResponseEntity<Map<String, Object>>> vaultFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Service Unavailable",
                "message", "PQC Vault Service is currently unreachable. Gateway Circuit Breaker engaged.",
                "service", "pqc-vault-service",
                "timestamp", Instant.now().toString()
        )));
    }

    @RequestMapping("/rates")
    public Mono<ResponseEntity<Map<String, Object>>> ratesFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Service Unavailable",
                "message", "Market Rate Service is currently unreachable. Gateway Circuit Breaker engaged.",
                "service", "market-rate-service",
                "timestamp", Instant.now().toString()
        )));
    }

    @RequestMapping("/common")
    public Mono<ResponseEntity<Map<String, Object>>> commonFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Service Unavailable",
                "message", "Downstream service is currently unavailable.",
                "timestamp", Instant.now().toString()
        )));
    }
}
