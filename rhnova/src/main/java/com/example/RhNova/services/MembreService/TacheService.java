package com.example.RhNova.services.MembreService;

import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.enums.StatutTache;

import java.util.List;

public interface TacheService {
    // Legacy methods
    Tachedto createTache(Tachedto tacheDto);
    Tachedto updateTache(String id, Tachedto tacheDto);
    void deleteTache(String id);
    List<Tachedto> getAllTaches();
    Tachedto getTacheById(String id);
    List<Tachedto> getTachesByMembre(String membreId);
    List<Tachedto> getTachesByEquipe(String equipeId);
    List<Tachedto> getTachesByProjet(String projetId);
    List<Tachedto> filterTaches(StatutTache statut, String priorite);
    Tachedto updateStatut(String id, StatutTache statut);
    Tachedto updateProgression(String id, Integer progression);
    Tachedto updateEvaluation(String id, Integer evaluation);
    
    // New role-based methods for Managers
    Tachedto createTaskByManager(Tachedto tacheDto);
    Tachedto assignTaskToMember(String taskId, String memberId);
    List<Tachedto> getTasksByManagerTeam();
    List<Tachedto> getTeamTasksByStatus(StatutTache status);
    Tachedto evaluateTask(String taskId, Integer evaluation);
    
    // New role-based methods for Team Members
    List<Tachedto> getMyAssignedTasks();
    List<Tachedto> getMyTeamTasks();
    Tachedto updateMyTaskProgress(String taskId, Integer progression);
    Tachedto updateMyTaskStatus(String taskId, StatutTache status);
    
    // Common methods with authentication
    Tachedto getTaskByIdWithAuth(String taskId);
}
