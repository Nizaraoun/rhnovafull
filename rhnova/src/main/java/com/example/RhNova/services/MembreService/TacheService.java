package com.example.RhNova.services.MembreService;

import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.enums.StatutTache;

import java.util.List;

public interface TacheService {
    Tachedto createTache(Tachedto tacheDto);
    Tachedto updateTache(String id, Tachedto tacheDto);
    void deleteTache(String id);
    List<Tachedto> getAllTaches();
    Tachedto getTacheById(String id);
    List<Tachedto> getTachesByMembre(String membreId);
    List<Tachedto> getTachesByEquipe(String equipeId);
    List<Tachedto> filterTaches(StatutTache statut, String priorite);
    Tachedto updateStatut(String id, StatutTache statut);
    Tachedto updateProgression(String id, Integer progression);
    Tachedto updateEvaluation(String id, Integer evaluation);

}
