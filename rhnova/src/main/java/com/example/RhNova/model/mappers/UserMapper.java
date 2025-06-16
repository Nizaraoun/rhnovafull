package com.example.RhNova.model.mappers;

import com.example.RhNova.dto.userdto;
import com.example.RhNova.model.entity.User;

public class UserMapper {

    public static userdto toDTO(User user) {
        userdto dto = new userdto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }

    public static User toEntity(userdto dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());
        return user;
    }
}
