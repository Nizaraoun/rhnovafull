package com.example.RhNova.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.example.RhNova.model.enums.Priorite;
import com.example.RhNova.model.enums.StatutTache;
import lombok.Data;

@Data
public class Tachedto {
    private String id;
    private String titre;
    private String description;
    private Priorite priorite;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutTache statut;
    private String membreId; // ID de l'utilisateur affecté
    private String membreName; // Name of assigned team member
    private Integer progression;
    private Integer evaluation;
    private String createdById; // ID of user who created the task
    private String createdByName; // Name of user who created the task
    private LocalDateTime dateCreation;
    private LocalDateTime lastUpdated;
}
