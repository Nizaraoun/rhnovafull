package com.example.RhNova.model.mappers;

import com.example.RhNova.dto.ProjetDto;
import com.example.RhNova.model.entity.Projet;
import org.springframework.stereotype.Component;

@Component
public class ProjetMapper {

    public ProjetDto toDto(Projet projet) {
        if (projet == null) {
            return null;
        }

        ProjetDto dto = new ProjetDto();
        dto.setId(projet.getId());
        dto.setNom(projet.getNom());
        dto.setDescription(projet.getDescription());
        dto.setBudget(projet.getBudget());
        dto.setDateDebut(projet.getDateDebut());
        dto.setDateFin(projet.getDateFin());
        dto.setStatut(projet.getStatut());
        dto.setProgression(projet.getProgression());
        dto.setDateCreation(projet.getDateCreation());
        dto.setLastUpdated(projet.getLastUpdated());

        // Manager information
        if (projet.getManager() != null) {
            dto.setManagerId(projet.getManager().getId());
            dto.setManagerName(projet.getManager().getName());
        }

        // Team information
        if (projet.getEquipe() != null) {
            dto.setEquipeId(projet.getEquipe().getId());
            dto.setEquipeNom(projet.getEquipe().getNom());
        }

        return dto;
    }

    public Projet toEntity(ProjetDto dto) {
        if (dto == null) {
            return null;
        }

        Projet projet = new Projet();
        projet.setId(dto.getId());
        projet.setNom(dto.getNom());
        projet.setDescription(dto.getDescription());
        projet.setBudget(dto.getBudget());
        projet.setDateDebut(dto.getDateDebut());
        projet.setDateFin(dto.getDateFin());
        projet.setStatut(dto.getStatut());
        projet.setProgression(dto.getProgression());
        projet.setDateCreation(dto.getDateCreation());
        projet.setLastUpdated(dto.getLastUpdated());

        // Note: Manager and Equipe should be set separately in the service
        // as they require database lookups

        return projet;
    }
}
