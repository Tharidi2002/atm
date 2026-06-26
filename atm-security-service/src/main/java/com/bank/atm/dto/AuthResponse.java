package com.bank.atm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private String role;
    private Long bankId;
    private Long branchId;
    private Long userId;
}