package com.adgbank.pqcvault.crypto;

import org.bouncycastle.crypto.AsymmetricCipherKeyPair;
import org.bouncycastle.pqc.crypto.crystals.dilithium.DilithiumKeyGenerationParameters;
import org.bouncycastle.pqc.crypto.crystals.dilithium.DilithiumKeyPairGenerator;
import org.bouncycastle.pqc.crypto.crystals.dilithium.DilithiumParameters;
import org.bouncycastle.pqc.crypto.crystals.dilithium.DilithiumPrivateKeyParameters;
import org.bouncycastle.pqc.crypto.crystals.dilithium.DilithiumPublicKeyParameters;
import org.bouncycastle.pqc.crypto.crystals.dilithium.DilithiumSigner;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Low-level post-quantum cryptographic engine implementing CRYSTALS-Dilithium3 (NIST FIPS 204 ML-DSA).
 * Uses Bouncy Castle low-level PQC primitives directly without relying on JCA provider registration.
 */
@Component
public class PqcDilithiumEngine {

    public static final String ALGORITHM_NAME = "CRYSTALS-Dilithium3";
    private final SecureRandom secureRandom;

    public PqcDilithiumEngine() {
        this.secureRandom = new SecureRandom();
    }

    /**
     * Container record for raw encoded post-quantum key pair bytes.
     */
    public record RawDilithiumKeyPair(byte[] publicKeyBytes, byte[] privateKeyBytes) {}

    /**
     * Generates a new CRYSTALS-Dilithium3 keypair using cryptographically secure random bytes.
     *
     * @return RawDilithiumKeyPair with public and private key encoded byte arrays.
     */
    public RawDilithiumKeyPair generateKeyPair() {
        DilithiumKeyPairGenerator generator = new DilithiumKeyPairGenerator();
        generator.init(new DilithiumKeyGenerationParameters(secureRandom, DilithiumParameters.dilithium3));

        AsymmetricCipherKeyPair keyPair = generator.generateKeyPair();
        DilithiumPublicKeyParameters pub = (DilithiumPublicKeyParameters) keyPair.getPublic();
        DilithiumPrivateKeyParameters priv = (DilithiumPrivateKeyParameters) keyPair.getPrivate();

        return new RawDilithiumKeyPair(pub.getEncoded(), priv.getEncoded());
    }

    /**
     * Signs a message payload with CRYSTALS-Dilithium3 using raw private key bytes.
     *
     * @param privateKeyBytes raw encoded Dilithium3 private key
     * @param message byte payload to sign (canonical string bytes)
     * @return raw signature bytes
     */
    public byte[] sign(byte[] privateKeyBytes, byte[] message) {
        if (privateKeyBytes == null || privateKeyBytes.length == 0) {
            throw new IllegalArgumentException("Private key bytes must not be null or empty");
        }
        if (message == null) {
            throw new IllegalArgumentException("Message must not be null");
        }

        DilithiumPrivateKeyParameters privKeyParams = new DilithiumPrivateKeyParameters(
                DilithiumParameters.dilithium3,
                privateKeyBytes,
                (DilithiumPublicKeyParameters) null
        );

        DilithiumSigner signer = new DilithiumSigner();
        signer.init(true, privKeyParams);
        return signer.generateSignature(message);
    }

    /**
     * Verifies a Dilithium3 signature against a message payload using raw public key bytes.
     *
     * @param publicKeyBytes raw encoded Dilithium3 public key
     * @param message byte payload to verify against
     * @param signature signature bytes to verify
     * @return true if signature is valid, false otherwise
     */
    public boolean verify(byte[] publicKeyBytes, byte[] message, byte[] signature) {
        if (publicKeyBytes == null || publicKeyBytes.length == 0) {
            throw new IllegalArgumentException("Public key bytes must not be null or empty");
        }
        if (message == null) {
            throw new IllegalArgumentException("Message must not be null");
        }
        if (signature == null || signature.length == 0) {
            return false;
        }

        try {
            DilithiumPublicKeyParameters pubKeyParams = new DilithiumPublicKeyParameters(
                    DilithiumParameters.dilithium3,
                    publicKeyBytes
            );

            DilithiumSigner verifier = new DilithiumSigner();
            verifier.init(false, pubKeyParams);
            return verifier.verifySignature(message, signature);
        } catch (Exception e) {
            return false;
        }
    }
}
