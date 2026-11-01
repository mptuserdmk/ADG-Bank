package com.adgbank.userservice.service;

import com.adgbank.common.dto.CreateUserRequest;
import com.adgbank.common.dto.UserDto;
import com.adgbank.userservice.entity.UserEntity;
import com.adgbank.userservice.exception.UserAlreadyExistsException;
import com.adgbank.userservice.exception.UserNotFoundException;
import com.adgbank.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already in use: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already in use: " + request.email());
        }

        UserEntity entity = new UserEntity(
                request.username().trim(),
                request.email().trim().toLowerCase(),
                request.fullName().trim()
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

