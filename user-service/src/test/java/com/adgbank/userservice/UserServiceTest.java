package com.adgbank.userservice;

import com.adgbank.common.dto.AuthResponse;
import com.adgbank.common.dto.CreateUserRequest;
import com.adgbank.common.dto.LoginRequest;
import com.adgbank.common.dto.RegisterRequest;
import com.adgbank.common.dto.UserDto;
import com.adgbank.userservice.entity.UserEntity;
import com.adgbank.userservice.exception.UserAlreadyExistsException;
import com.adgbank.userservice.repository.UserRepository;
import com.adgbank.userservice.security.JwtService;
import com.adgbank.userservice.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    private CreateUserRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new CreateUserRequest("alex_dev", "alex@adgbank.com", "Alex Developer");
    }

    @Test
    @DisplayName("Should create user successfully when username and email are unique")
    void shouldCreateUserSuccessfully() {
        when(userRepository.existsByUsername("alex_dev")).thenReturn(false);
        when(userRepository.existsByEmail("alex@adgbank.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_default");

        UserEntity savedEntity = new UserEntity("alex_dev", "alex@adgbank.com", "Alex Developer", "hashed_default", "ROLE_USER");
        savedEntity.setId(1L);
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedEntity);

        UserDto result = userService.createUser(validRequest);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.username()).isEqualTo("alex_dev");
        assertThat(result.email()).isEqualTo("alex@adgbank.com");
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when username already taken")
    void shouldThrowWhenUsernameExists() {
        when(userRepository.existsByUsername("alex_dev")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(validRequest))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("Username already in use: alex_dev");

        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    @DisplayName("Should register new user, encode password and return JWT AuthResponse")
    void shouldRegisterNewUser() {
        RegisterRequest registerRequest = new RegisterRequest("john_doe", "john@adgbank.com", "John Doe", "SecretPass123");

        when(userRepository.existsByUsername("john_doe")).thenReturn(false);
        when(userRepository.existsByEmail("john@adgbank.com")).thenReturn(false);
        when(passwordEncoder.encode("SecretPass123")).thenReturn("$2a$10$encodedHashSecret");

        UserEntity savedEntity = new UserEntity("john_doe", "john@adgbank.com", "John Doe", "$2a$10$encodedHashSecret", "ROLE_USER");
        savedEntity.setId(5L);
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedEntity);
        when(jwtService.generateToken(5L, "john_doe", "john@adgbank.com", "ROLE_USER")).thenReturn("mock-jwt-token-xyz");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse authResponse = userService.register(registerRequest);

        assertThat(authResponse).isNotNull();
        assertThat(authResponse.token()).isEqualTo("mock-jwt-token-xyz");
        assertThat(authResponse.userId()).isEqualTo(5L);
        assertThat(authResponse.username()).isEqualTo("john_doe");
        assertThat(authResponse.type()).isEqualTo("Bearer");
    }

    @Test
    @DisplayName("Should login successfully with valid credentials and return JWT AuthResponse")
    void shouldLoginSuccessfully() {
        LoginRequest loginRequest = new LoginRequest("john_doe", "SecretPass123");
        UserEntity user = new UserEntity("john_doe", "john@adgbank.com", "John Doe", "$2a$10$encodedHashSecret", "ROLE_USER");
        user.setId(5L);

        when(userRepository.findByUsernameOrEmail("john_doe", "john_doe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("SecretPass123", "$2a$10$encodedHashSecret")).thenReturn(true);
        when(jwtService.generateToken(5L, "john_doe", "john@adgbank.com", "ROLE_USER")).thenReturn("mock-jwt-token-xyz");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse authResponse = userService.login(loginRequest);

        assertThat(authResponse).isNotNull();
        assertThat(authResponse.token()).isEqualTo("mock-jwt-token-xyz");
        assertThat(authResponse.userId()).isEqualTo(5L);
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password does not match on login")
    void shouldFailLoginWhenPasswordWrong() {
        LoginRequest loginRequest = new LoginRequest("john_doe", "WrongPass!");
        UserEntity user = new UserEntity("john_doe", "john@adgbank.com", "John Doe", "$2a$10$encodedHashSecret", "ROLE_USER");

        when(userRepository.findByUsernameOrEmail("john_doe", "john_doe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass!", "$2a$10$encodedHashSecret")).thenReturn(false);

        assertThatThrownBy(() -> userService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid username or password");
    }
}
