package com.adgbank.pqcvault.exception;

import java.util.UUID;

public class KeyNotFoundException extends RuntimeException {

    public KeyNotFoundException(UUID keyId) {
        super("PQC Key record not found for id: " + keyId);
    }

    public KeyNotFoundException(String message) {
        super(message);
    }
}

