package com.example.RhNova.model.mappers;

import com.example.RhNova.dto.Entretiendto;
import com.example.RhNova.dto.CreateEntretienDto;
import com.example.RhNova.dto.CandidatSimpleDto;
import com.example.RhNova.model.entity.ResponRH.Entretien;
import com.example.RhNova.model.entity.Candidat.Candidature;

import java.time.LocalDateTime;

public class EntretienMapper {

    public static Entretiendto toDTO(Entretien entretien) {
        if (entretien == null) return null;
        
        return Entretiendto.builder()
                .id(entretien.getId())
                .candidatureId(entretien.getCandidature() != null ? entretien.getCandidature().getId() : null)
                .candidatId(entretien.getCandidature() != null && entretien.getCandidature().getCandidat() != null 
                    ? entretien.getCandidature().getCandidat().getId() : null)
                .candidatNom(entretien.getCandidature() != null && entretien.getCandidature().getCandidat() != null 
                    ? entretien.getCandidature().getCandidat().getName() : null)
                .candidatEmail(entretien.getCandidature() != null && entretien.getCandidature().getCandidat() != null 
                    ? entretien.getCandidature().getCandidat().getEmail() : null)
                .offreId(entretien.getCandidature() != null && entretien.getCandidature().getOffre() != null 
                    ? entretien.getCandidature().getOffre().getId() : null)
                .titreOffre(entretien.getCandidature() != null && entretien.getCandidature().getOffre() != null 
                    ? entretien.getCandidature().getOffre().getTitre() : null)
                .dateEntretien(entretien.getDateEntretien())
                .heureEntretien(entretien.getHeureEntretien())
                .dureeMinutes(entretien.getDureeMinutes())
                .type(entretien.getType())
                .statut(entretien.getStatut())
                .lieu(entretien.getLieu())
                .lienVisio(entretien.getLienVisio())
                .objectifs(entretien.getObjectifs())
                .commentaires(entretien.getCommentaires())
                .note(entretien.getNote())
                .dateCreation(entretien.getDateCreation())
                .dateModification(entretien.getDateModification())
                .responsableRHId(entretien.getResponsableRH() != null ? entretien.getResponsableRH().getId() : null)
                .responsableRHNom(entretien.getResponsableRH() != null ? entretien.getResponsableRH().getName() : null)
                .build();
    }

    public static Entretien toEntity(CreateEntretienDto dto) {
        if (dto == null) return null;
        
        return Entretien.builder()
                .dateEntretien(dto.getDateEntretien())
                .heureEntretien(dto.getHeureEntretien())
                .dureeMinutes(dto.getDureeMinutes())
                .type(dto.getType())
                .statut(dto.getStatut())
                .lieu(dto.getLieu())
                .lienVisio(dto.getLienVisio())
                .objectifs(dto.getObjectifs())
                .commentaires(dto.getCommentaires())
                .note(dto.getNote())
                .dateCreation(LocalDateTime.now())
                .build();
    }

    public static CandidatSimpleDto toCandidatSimpleDto(Candidature candidature) {
        if (candidature == null) return null;
        
        return CandidatSimpleDto.builder()
                .candidatureId(candidature.getId())
                .candidatId(candidature.getCandidat() != null ? candidature.getCandidat().getId() : null)
                .nom(candidature.getCandidat() != null ? candidature.getCandidat().getName() : null)
                .prenom("") // User entity doesn't have firstName field
                .email(candidature.getCandidat() != null ? candidature.getCandidat().getEmail() : null)
                .nomComplet(candidature.getCandidat() != null ? candidature.getCandidat().getName() : null)
                .titreOffre(candidature.getOffre() != null ? candidature.getOffre().getTitre() : null)
                .offreId(candidature.getOffre() != null ? candidature.getOffre().getId() : null)
                .build();
    }

    public static void updateEntityFromDto(Entretien entretien, CreateEntretienDto dto) {
        if (entretien == null || dto == null) return;
        
        entretien.setDateEntretien(dto.getDateEntretien());
        entretien.setHeureEntretien(dto.getHeureEntretien());
        entretien.setDureeMinutes(dto.getDureeMinutes());
        entretien.setType(dto.getType());
        entretien.setStatut(dto.getStatut());
        entretien.setLieu(dto.getLieu());
        entretien.setLienVisio(dto.getLienVisio());
        entretien.setObjectifs(dto.getObjectifs());
        entretien.setCommentaires(dto.getCommentaires());
        entretien.setNote(dto.getNote());
        entretien.setDateModification(LocalDateTime.now());
    }
}
