package com.adgbank.apigateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String SECRET = "adg-quantum-bank-jwt-secret-key-super-secure-32b-min!";
    private JwtUtil jwtUtil;
    private SecretKey secretKey;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET);
        secretKey = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    @DisplayName("Should extract userId and username from valid token")
    void shouldExtractClaimsFromValidToken() {
        String token = Jwts.builder()
                .subject("alex_dev")
                .claim("userId", 42L)
                .claim("role", "ROLE_USER")
                .issuedAt(new Date())
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(secretKey)
                .compact();

        assertThat(jwtUtil.isTokenValid(token)).isTrue();
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(42L);
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("alex_dev");
    }

    @Test
    @DisplayName("Should return false for expired token")
    void shouldRejectExpiredToken() {
        String expiredToken = Jwts.builder()
                .subject("alex_dev")
                .claim("userId", 42L)
                .issuedAt(Date.from(Instant.now().minusSeconds(7200)))
                .expiration(Date.from(Instant.now().minusSeconds(3600)))
                .signWith(secretKey)
                .compact();

        assertThat(jwtUtil.isTokenValid(expiredToken)).isFalse();
    }

    @Test
    @DisplayName("Should return false for invalid signature / corrupted token")
    void shouldRejectCorruptedToken() {
        String token = Jwts.builder()
                .subject("alex_dev")
                .claim("userId", 42L)
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(secretKey)
                .compact();

        String corruptedToken = token + "corrupted";
        assertThat(jwtUtil.isTokenValid(corruptedToken)).isFalse();
    }
}

