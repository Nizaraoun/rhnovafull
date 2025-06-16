package com.example.RhNova.services;

import com.example.RhNova.dto.DemandeCongedto;
import com.example.RhNova.model.entity.DemandeConge;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.repositories.DemandeCongeRepository;
import com.example.RhNova.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DemandeCongeService {

    private final DemandeCongeRepository congeRepository;
    private final UserRepository userRepository;

    @Autowired
    public DemandeCongeService(DemandeCongeRepository congeRepository, UserRepository userRepository) {
        this.congeRepository = congeRepository;
        this.userRepository = userRepository;
    }

    public DemandeConge createDemande(DemandeCongedto dto) {
        User employe = userRepository.findById(dto.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        User validateur = userRepository.findById(dto.getValidateurId())
                .orElseThrow(() -> new RuntimeException("Validateur non trouvé"));

        DemandeConge demande = new DemandeConge();
        demande.setEmploye(employe);
        demande.setValidateur(validateur);
        demande.setDateDebut(dto.getDateDebut());
        demande.setDateFin(dto.getDateFin());
        demande.setTypeConge(dto.getTypeConge());
        demande.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutDemandeConge.EN_ATTENTE);

        return congeRepository.save(demande);
    }

    public List<DemandeConge> getAll() {
        return congeRepository.findAll();
    }

    public void deleteById(String id) {
        congeRepository.deleteById(id);
    }
}
