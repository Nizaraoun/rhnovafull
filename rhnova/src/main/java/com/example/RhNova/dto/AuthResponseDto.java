package com.example.RhNova.dto;

import com.example.RhNova.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private String userId;
    private String name;
    private String email;
    private Role role;
    private String message;
}
