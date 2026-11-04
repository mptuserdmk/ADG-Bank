package com.adgbank.common.dto;

public record AuthResponse(
        String token,
        String type,
        Long userId,
        String username,
        String email,
        String fullName,
        String role,
        long expiresIn
) {
    public AuthResponse(String token, Long userId, String username, String email, String fullName, String role, long expiresIn) {
        this(token, "Bearer", userId, username, email, fullName, role, expiresIn);
    }
}
