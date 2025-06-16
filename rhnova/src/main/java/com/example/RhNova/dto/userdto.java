package com.example.RhNova.dto;


import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;

import lombok.Data;
@Data
public class userdto {
    private String id;
    private String name;
    private String email;
    private String password; 
    private Role role;

    public userdto() {    // constructeur vide

    }

    public userdto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
    }
}