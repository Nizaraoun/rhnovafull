package com.example.RhNova.model.entity.Manager;

import java.util.List;

import com.example.RhNova.model.entity.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

@Document(collection = "equipes")
@Data
public class Equipe {

    @Id
    private String id;

    private String nom;

    private String description;

    // Chaque équipe a un manager (user avec rôle MANAGER)
    @DBRef
    private User manager;

    // Une équipe contient plusieurs membres (utilisateurs)
    @DBRef
    private List<User> membres;
}