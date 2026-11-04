package com.adgbank.userservice.service;

import com.adgbank.common.dto.AuthResponse;
import com.adgbank.common.dto.CreateUserRequest;
import com.adgbank.common.dto.LoginRequest;
import com.adgbank.common.dto.RegisterRequest;
import com.adgbank.common.dto.UserDto;
import com.adgbank.userservice.entity.UserEntity;
import com.adgbank.userservice.exception.UserAlreadyExistsException;
import com.adgbank.userservice.exception.UserNotFoundException;
import com.adgbank.userservice.repository.UserRepository;
import com.adgbank.userservice.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    public UserDto getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::toDto)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("Username already in use: " + username);
        }
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email already in use: " + email);
        }

        String passwordHash = passwordEncoder.encode(request.password());
        UserEntity entity = new UserEntity(username, email, request.fullName().trim(), passwordHash, "ROLE_USER");
        UserEntity saved = userRepository.save(entity);

        log.info("Registered new user id={} username={}", saved.getId(), saved.getUsername());
        String token = jwtService.generateToken(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole());

        return new AuthResponse(
                token,
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole(),
                jwtService.getExpirationMs()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.username().trim();

        UserEntity user = userRepository.findByUsernameOrEmail(identifier, identifier.toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        log.info("User logged in successfully id={} username={}", user.getId(), user.getUsername());
        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                jwtService.getExpirationMs()
        );
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already in use: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already in use: " + request.email());
        }

        String defaultHash = passwordEncoder.encode("DefaultP@ss123");
        UserEntity entity = new UserEntity(
                request.username().trim(),
                request.email().trim().toLowerCase(),
                request.fullName().trim(),
                defaultHash,
                "ROLE_USER"
        );

        UserEntity saved = userRepository.save(entity);
        return toDto(saved);
    }

    private UserDto toDto(UserEntity entity) {
        return new UserDto(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getFullName(),
                entity.getCreatedAt()
        );
    }
}
