package com.example.RhNova.repositories;

import java.util.List;

import com.example.RhNova.model.entity.Projet;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Manager.Equipe;
import com.example.RhNova.model.enums.StatutProjet;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjetRepository extends MongoRepository<Projet, String> {
    
    // Find projects by manager
    List<Projet> findByManager(User manager);
    
    // Find projects by team
    List<Projet> findByEquipe(Equipe equipe);
    
    // Find projects by status
    List<Projet> findByStatut(StatutProjet statut);
    
    // Find projects by manager and status
    List<Projet> findByManagerAndStatut(User manager, StatutProjet statut);
    
    // Find projects by team and status
    List<Projet> findByEquipeAndStatut(Equipe equipe, StatutProjet statut);
    
    // Find projects by manager ordered by creation date
    List<Projet> findByManagerOrderByDateCreationDesc(User manager);
    
    // Find projects by team ordered by creation date
    List<Projet> findByEquipeOrderByDateCreationDesc(Equipe equipe);
}
