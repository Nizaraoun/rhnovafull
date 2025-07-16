package com.example.RhNova.services.Managerservice;

import java.util.List;

import com.example.RhNova.dto.ProjetDto;
import com.example.RhNova.model.enums.StatutProjet;

public interface ProjetService {
    
    // Manager operations
    ProjetDto createProjet(ProjetDto projetDto);
    ProjetDto updateProjet(String projetId, ProjetDto projetDto);
    void deleteProjet(String projetId);
    
    // Get operations
    ProjetDto getProjetById(String projetId);
    List<ProjetDto> getMyProjets(); // Get projects created by current manager
    List<ProjetDto> getProjetsByStatus(StatutProjet statut);
    List<ProjetDto> getMyTeamProjets(); // Get projects assigned to current user's team
    
    // Project management
    ProjetDto updateProjetStatus(String projetId, StatutProjet statut);
    ProjetDto assignProjetToTeam(String projetId, String equipeId);
    
    // Project statistics
    void updateProjetProgression(String projetId); // Automatically calculate based on tasks
    
    // Validation
    boolean canUserAccessProjet(String projetId, String userEmail);
    boolean canUserManageProjet(String projetId, String userEmail);
}
