package com.bank.atm.service;

import com.bank.atm.dto.LoginRequest;
import com.bank.atm.dto.RegisterRequest;
import com.bank.atm.dto.AuthResponse;
import com.bank.atm.entity.User;
import com.bank.atm.repository.UserRepository;
import com.bank.atm.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user);

        return new AuthResponse(
            token,
            user.getUsername(),
            user.getFullName(),
            user.getRole().toString(),
            user.getBankId(),
            user.getBranchId(),
            user.getId()
        );
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(User.Role.valueOf(request.getRole()));
        user.setBankId(request.getBankId());
        user.setBranchId(request.getBranchId());

        return userRepository.save(user);
    }
}