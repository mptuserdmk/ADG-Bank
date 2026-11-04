package com.adgbank.pqcvault.exception;

public class CryptoOperationException extends RuntimeException {

    public CryptoOperationException(String message, Throwable cause) {
        super(message, cause);
    }

    public CryptoOperationException(String message) {
        super(message);
    }
}

