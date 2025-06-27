package com.example.RhNova.dto;

import com.example.RhNova.model.enums.Role;
import lombok.Data;

@Data
public class CreateEmployeeAccountDto {
    private String employeId;
    private String password;
    private String confirmPassword;
    private Boolean sendWelcomeEmail;
    private String temporaryPassword;
    private Role role;
}
