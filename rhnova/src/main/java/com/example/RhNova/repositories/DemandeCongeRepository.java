package com.example.RhNova.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import com.example.RhNova.model.entity.DemandeConge;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.model.enums.TypeConge;

import java.time.LocalDate;
import java.util.List;

public interface DemandeCongeRepository extends MongoRepository<DemandeConge, String> {
    
    List<DemandeConge> findByStatut(StatutDemandeConge statut);
    
    List<DemandeConge> findByTypeConge(TypeConge typeConge);
    
    List<DemandeConge> findByEmploye(User employe);
    
    List<DemandeConge> findByValidateur(User validateur);
    
    @Query("{'employe.equipe.id': ?0, 'statut': ?1}")
    List<DemandeConge> findByEmploye_Equipe_IdAndStatut(String equipeId, StatutDemandeConge statut);
    
    List<DemandeConge> findByDateDebutBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("{'dateDebut': {$lte: ?0}, 'dateFin': {$gte: ?1}}")
    List<DemandeConge> findByDateDebutLessThanEqualAndDateFinGreaterThanEqual(LocalDate endDate, LocalDate startDate);
    
    List<DemandeConge> findByEmployeAndStatut(User employe, StatutDemandeConge statut);
    
    @Query("{'dateCreation': {$gte: ?0, $lte: ?1}}")
    List<DemandeConge> findByDateCreationBetween(LocalDate startDate, LocalDate endDate);
}
