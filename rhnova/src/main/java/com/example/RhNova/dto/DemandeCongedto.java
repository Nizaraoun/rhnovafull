package com.example.RhNova.dto;

import java.time.LocalDate;

import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.model.enums.TypeConge;

import lombok.Data;

@Data
public class DemandeCongedto {
    private String employeId;
    private String validateurId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private TypeConge typeConge; 
    private StatutDemandeConge statut; // Optionnel en POST (souvent INITIALE)
}
