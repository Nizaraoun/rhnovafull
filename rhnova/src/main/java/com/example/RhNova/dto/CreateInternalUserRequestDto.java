package com.example.RhNova.dto;

import com.example.RhNova.model.enums.Role;
import lombok.Data;

@Data
public class CreateInternalUserRequestDto {
    private String name;
    private String email;
    private String password;
    private Role role; // RESPONSABLERH, MANAGER, or MEMBRE_EQUIPE
}
