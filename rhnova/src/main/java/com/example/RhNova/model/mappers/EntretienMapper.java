package com.example.RhNova.model.mappers;

import com.example.RhNova.dto.Entretiendto;
import com.example.RhNova.model.entity.ResponRH.Entretien;

public class EntretienMapper {

    public static Entretiendto toDTO(Entretien entretien) {
        Entretiendto dto = new Entretiendto();
        dto.setId(entretien.getId());
        dto.setCandidatId(entretien.getCandidat().getId());
        dto.setCandidatNom(entretien.getCandidat().getName());
        dto.setOffreId(entretien.getOffre().getId());
        dto.setTitreOffre(entretien.getOffre().getTitre());
        dto.setDateHeure(entretien.getDateHeure());
        dto.setLieu(entretien.getLieu());
        dto.setInformationsComplementaires(entretien.getInformationsComplementaires());
        return dto;
    }

    public static Entretien toEntity(Entretiendto dto) {
        Entretien entretien = new Entretien();
        entretien.setId(dto.getId());
        // On lie l’ID du candidat et de l’offre plus tard via le service
        entretien.setDateHeure(dto.getDateHeure());
        entretien.setLieu(dto.getLieu());
        entretien.setInformationsComplementaires(dto.getInformationsComplementaires());
        return entretien;
    }
}
