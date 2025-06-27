package com.example.RhNova.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.RhNova.model.enums.Priorite;
import com.example.RhNova.model.enums.StatutTache;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

@Document(collection = "taches")
@Data
public class Tache {

    @Id
    private String id;

    private String titre;

    private String description;

    private Priorite priorite;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private StatutTache statut;

    private Integer progression; // 0 à 100
    private Integer evaluation; // Ex : 0 à 10

    @DBRef
    private User membre; // Assigned team member

    @DBRef
    private User createdBy; // User who created the task (usually manager)
    
    private LocalDateTime dateCreation; // When the task was created
    
    private LocalDateTime lastUpdated; // When the task was last updated
}
