package com.example.RhNova.dto;

import java.time.LocalDate;
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
    private Integer progression;
    private Integer evaluation;

}
