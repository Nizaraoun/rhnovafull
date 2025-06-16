package com.example.RhNova.model.entity;

import java.time.LocalDate;

import com.example.RhNova.model.enums.Priorite;
import com.example.RhNova.model.enums.StatutTache;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import com.example.RhNova.model.entity.User;

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
    private User membre;
}
