package com.example.RhNova.model.mappers;

import com.example.RhNova.dto.Equipedto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Manager.Equipe;

import java.util.List;
import java.util.stream.Collectors;

public class EquipeMapper {

    public static Equipedto toDTO(Equipe equipe) {
        Equipedto dto = new Equipedto();
        dto.setId(equipe.getId());
        dto.setNom(equipe.getNom());
        dto.setDescription(equipe.getDescription());
        dto.setManagerId(equipe.getManager() != null ? equipe.getManager().getId() : null);
        
        List<String> membreIds = equipe.getMembres() != null ? equipe.getMembres().stream()
                .map(User::getId)
                .collect(Collectors.toList()) : null;
        dto.setMembreIds(membreIds);
        
        // Set the number of members
        dto.setNombreMembres(equipe.getMembres() != null ? equipe.getMembres().size() : 0);
        
        System.out.println(dto);
        return dto;
    }

    public static Equipe fromDTO(Equipedto dto, User manager, List<User> membres) {
        Equipe equipe = new Equipe();
        equipe.setId(dto.getId()); // facultatif pour POST
        equipe.setNom(dto.getNom());
        equipe.setDescription(dto.getDescription());
        equipe.setManager(manager);
        equipe.setMembres(membres);
        return equipe;
    }
}
