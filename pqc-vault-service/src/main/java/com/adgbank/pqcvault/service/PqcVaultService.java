package com.adgbank.pqcvault.service;

import com.adgbank.pqcvault.dto.GenerateKeyRequest;
import com.adgbank.pqcvault.dto.KeyResponse;
import com.adgbank.pqcvault.dto.SignRequest;
import com.adgbank.pqcvault.dto.SignResponse;
import com.adgbank.pqcvault.dto.VerifyRequest;
import com.adgbank.pqcvault.dto.VerifyResponse;

import java.util.UUID;

public interface PqcVaultService {

    KeyResponse generateKeyPair(GenerateKeyRequest request);

    SignResponse sign(SignRequest request);

    VerifyResponse verify(VerifyRequest request);

    KeyResponse getKey(UUID keyId);

    KeyResponse getLatestKeyForAccount(String accountId);
}

