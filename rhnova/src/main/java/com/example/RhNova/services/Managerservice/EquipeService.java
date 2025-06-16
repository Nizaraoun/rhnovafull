package com.example.RhNova.services.Managerservice;

import com.example.RhNova.dto.Equipedto;
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


}