package com.example.RhNova.services.Managerservice;

import com.example.RhNova.dto.Equipedto;
import com.example.RhNova.dto.DetailedEquipeDto;
import com.example.RhNova.dto.userdto;

import java.util.List;

public interface EquipeService {
    Equipedto createEquipe(Equipedto dto);
    List<Equipedto> getAllEquipes();
    Equipedto getEquipeById(String id);
    Equipedto updateEquipe(String id, Equipedto dto);
    void deleteEquipe(String id);
    void addMembreToEquipe(String equipeId, String userId);
    void removeMembreFromEquipe(String equipeId, String userId);
    List<userdto> getMembresByEquipeId(String equipeId);
    
    // New method for team members to get their team details
    DetailedEquipeDto getMyTeamDetails(String userEmail);
    
    // New methods for manager-specific team details
    DetailedEquipeDto getManagerTeamDetails(String managerEmail);
    List<DetailedEquipeDto> getManagerTeamsDetails(String managerEmail);
    DetailedEquipeDto getTeamDetailsByManagerId(String managerId);
}