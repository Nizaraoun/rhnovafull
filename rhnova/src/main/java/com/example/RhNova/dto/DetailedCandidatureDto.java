package com.example.RhNova.dto;

import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.enums.StatutCandidature;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DetailedCandidatureDto {
    // Candidature info
    private String id;
    private LocalDate dateCandidature;
    private StatutCandidature statut;
    private String candidatId;
    private String offreId;
    private String profilId;
    
    // Candidate basic info
    private String candidatNom;
    private String candidatEmail;
    private Role candidatRole;
    
    // Job offer info
    private String offreTitre;
    private String offreDescription;
    private String offreLocalisation;
      // Profile detailed info
    private LocalDate dateDeNaissance;
    private String ville;
    private String pays;
    private String codePostal;
    private String phoneNumber;
    private String photo;
    private String profession;
    private List<String> formations;
    private List<String> experiences;
    private List<String> competences;
    private List<String> langues;
    private List<String> certifications;
    private List<String> projets;
    private String description;
}
