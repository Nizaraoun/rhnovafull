package com.example.RhNova.dto;

import com.example.RhNova.model.enums.StatutCandidature;
import lombok.Data;

import java.time.LocalDate;

@Data
public class Candidaturedto {
    private String id;
    private LocalDate dateCandidature;
    private StatutCandidature statut;
    private String candidatId;
    private String offreId;
    private String profilId;
}