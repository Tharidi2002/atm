package com.bank.atm.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}