package com.adgbank.marketrate.exception;

public class UnsupportedCurrencyException extends RuntimeException {

    public UnsupportedCurrencyException(String currency) {
        super("Unsupported currency code: '" + currency + "'. Supported currencies are: BTC, USDT, USD, EUR, RUB");
    }
}

