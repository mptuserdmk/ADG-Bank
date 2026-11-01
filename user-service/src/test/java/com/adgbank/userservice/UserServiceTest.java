package com.adgbank.userservice;

import com.adgbank.common.dto.CreateUserRequest;
import com.adgbank.common.dto.UserDto;
import com.adgbank.userservice.entity.UserEntity;
import com.adgbank.userservice.exception.UserAlreadyExistsException;
import com.adgbank.userservice.repository.UserRepository;
import com.adgbank.userservice.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

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

        UserEntity savedEntity = new UserEntity("alex_dev", "alex@adgbank.com", "Alex Developer");
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
                .hasMessageContaining("Username already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when email already registered")
    void shouldThrowWhenEmailExists() {
        when(userRepository.existsByUsername("alex_dev")).thenReturn(false);
        when(userRepository.existsByEmail("alex@adgbank.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(validRequest))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any());
    }
}

