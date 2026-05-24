package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.UserRegisterDto;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.ConflictException;
import com.syfe.personalfinance.exception.ResourceNotFoundException;
import com.syfe.personalfinance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private UserRegisterDto registerDto;
    private User user;

    @BeforeEach
    void setUp() {
        registerDto = UserRegisterDto.builder()
                .username("test@example.com")
                .password("password123")
                .fullName("Test User")
                .phoneNumber("1234567890")
                .build();

        user = User.builder()
                .id(1L)
                .username("test@example.com")
                .password("hashed_password")
                .fullName("Test User")
                .phoneNumber("1234567890")
                .build();
    }

    @Test
    void registerUser_Success() {
        when(userRepository.existsByUsername(registerDto.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(registerDto.getPassword())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User savedUser = userService.registerUser(registerDto);

        assertNotNull(savedUser);
        assertEquals("test@example.com", savedUser.getUsername());
        assertEquals("Test User", savedUser.getFullName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_ThrowsConflictException() {
        when(userRepository.existsByUsername(registerDto.getUsername())).thenReturn(true);

        assertThrows(ConflictException.class, () -> userService.registerUser(registerDto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserByUsername_Success() {
        when(userRepository.findByUsername("test@example.com")).thenReturn(Optional.of(user));

        User foundUser = userService.getUserByUsername("test@example.com");

        assertNotNull(foundUser);
        assertEquals("test@example.com", foundUser.getUsername());
    }

    @Test
    void getUserByUsername_ThrowsResourceNotFoundException() {
        when(userRepository.findByUsername("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserByUsername("notfound@example.com"));
    }
}
