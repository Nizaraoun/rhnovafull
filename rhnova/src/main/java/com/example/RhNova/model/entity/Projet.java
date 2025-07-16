package com.example.RhNova.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.RhNova.model.enums.StatutProjet;
import com.example.RhNova.model.entity.Manager.Equipe;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

@Document(collection = "projets")
@Data
public class Projet {

    @Id
    private String id;

    private String nom;

    private String description;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private StatutProjet statut;

    private Integer progression; // 0 à 100 (calculé automatiquement basé sur les tâches)

    @DBRef
    private User manager; // Manager qui a créé le projet

    @DBRef
    private Equipe equipe; // Équipe assignée au projet

    @DBRef
    private List<Tache> taches; // Liste des tâches du projet

    private LocalDateTime dateCreation; // When the project was created
    
    private LocalDateTime lastUpdated; // When the project was last updated
}
