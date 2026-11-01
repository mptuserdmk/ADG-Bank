package com.adgbank.common.dto;

import java.time.Instant;

public record UserDto(
        Long id,
        String username,
        String email,
        String fullName,
        Instant createdAt
) {}

