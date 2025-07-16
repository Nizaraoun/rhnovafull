package com.example.RhNova.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.RhNova.model.enums.StatutProjet;
import lombok.Data;

@Data
public class ProjetDto {
    private String id;
    private String nom;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutProjet statut;
    private Integer progression; // 0 à 100 (calculé automatiquement basé sur les tâches)
    private String managerId; // ID du manager
    private String managerName; // Nom du manager
    private String equipeId; // ID de l'équipe
    private String equipeNom; // Nom de l'équipe
    private List<Tachedto> taches; // Liste des tâches du projet
    private Integer nombreTaches; // Nombre total de tâches
    private Integer tachesCompletes; // Nombre de tâches terminées
    private LocalDateTime dateCreation;
    private LocalDateTime lastUpdated;
}
