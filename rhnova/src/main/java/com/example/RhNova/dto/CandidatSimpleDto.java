package com.example.RhNova.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatSimpleDto {
    private String candidatureId;
    private String candidatId;
    private String nom;
    private String prenom;
    private String email;
    private String nomComplet;
    private String titreOffre;
    private String offreId;
}
