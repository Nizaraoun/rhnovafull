package com.example.RhNova.dto;

import java.time.LocalDate;

import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.model.enums.TypeConge;

import lombok.Data;

@Data
public class DemandeCongedto {
    private String id;
    private String employeId;
    private String validateurId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private TypeConge typeConge; 
    private StatutDemandeConge statut; // Optionnel en POST (souvent INITIALE)
    private String raison; // Reason for leave
    private int nombreJours; // Total days calculated
    private LocalDate dateCreation; // Date when leave request was created
    private LocalDate dateValidation; // Date when leave was approved/rejected
    private String commentaireValidateur; // HR/Manager comments
    
    // Employee information for display
    private String employeNom;
    private String employePrenom;
    
    // Validator information for display
    private String validateurNom;
    private String validateurPrenom;
}
