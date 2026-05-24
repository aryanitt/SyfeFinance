package com.syfe.personalfinance.service;

import com.syfe.personalfinance.dto.UserRegisterDto;
import com.syfe.personalfinance.entity.User;
import com.syfe.personalfinance.exception.ConflictException;
import com.syfe.personalfinance.exception.ResourceNotFoundException;
import com.syfe.personalfinance.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public User registerUser(UserRegisterDto registerDto) {
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            throw new ConflictException("Email is already registered: " + registerDto.getUsername());
        }

        User user = User.builder()
                .username(registerDto.getUsername())
                .password(passwordEncoder.encode(registerDto.getPassword()))
                .fullName(registerDto.getFullName())
                .phoneNumber(registerDto.getPhoneNumber())
                .build();

        return userRepository.save(user);
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
}
