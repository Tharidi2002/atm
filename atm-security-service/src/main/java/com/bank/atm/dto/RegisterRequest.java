package com.bank.atm.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String role;  // BANK_ADMIN, BRANCH_ADMIN, BANK_USER
    private Long bankId;
    private Long branchId;
}