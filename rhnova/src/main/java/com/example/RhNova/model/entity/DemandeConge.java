package com.example.RhNova.model.entity;

import java.time.LocalDate;

import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.model.enums.TypeConge;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

@Document(collection = "demande_conges")
@Data
public class DemandeConge {

    @Id
    private String id;

    private StatutDemandeConge statut;

    private TypeConge typeConge;

    @DBRef
    private User employe;

    // Celui qui valide (manager, recruteur, ou admin selon le rôle du demandeur)
    @DBRef
    private User validateur;

    private LocalDate dateDebut;
    private LocalDate dateFin;
    
    private String raison; // Reason for leave
    
    private int nombreJours; // Total days calculated
    
    private LocalDate dateCreation; // Date when leave request was created
    
    private LocalDate dateValidation; // Date when leave was approved/rejected
    
    private String commentaireValidateur; // HR/Manager comments


}

