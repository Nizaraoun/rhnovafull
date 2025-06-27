package com.example.RhNova.dto;

import com.example.RhNova.model.enums.TypeEntretien;
import com.example.RhNova.model.enums.StatutEntretien;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entretiendto {
    private String id;
    private String candidatureId;
    private String candidatId;
    private String candidatNom;
    private String candidatEmail;
    private String offreId;
    private String titreOffre;
    private LocalDate dateEntretien;
    private LocalTime heureEntretien;
    private Integer dureeMinutes;
    private TypeEntretien type;
    private StatutEntretien statut;
    private String lieu;
    private String lienVisio;
    private String objectifs;
    private String commentaires;
    private Double note;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private String responsableRHId;
    private String responsableRHNom;
}
