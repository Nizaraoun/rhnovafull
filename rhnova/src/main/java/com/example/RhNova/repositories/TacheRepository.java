package com.example.RhNova.repositories;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import com.example.RhNova.model.entity.Tache;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Priorite;
import com.example.RhNova.model.enums.StatutTache;

public interface TacheRepository extends MongoRepository<Tache, String> {
    List<Tache> findByMembre(User membre);
    List<Tache> findByCreatedBy(User createdBy);
    List<Tache> findByStatut(StatutTache statut);
    @Query("{'membre.equipe.id': ?0}")
    List<Tache> findByMembre_Equipe_Id(String equipeId);
    List<Tache> findByStatutAndPriorite(StatutTache statut, Priorite priorite);
    
    // New methods for role-based task management
    @Query("{'membre.equipe.id': ?0, 'statut': ?1}")
    List<Tache> findByMembre_Equipe_IdAndStatut(String equipeId, StatutTache status);
    
    @Query("{'membre.equipe.manager.id': ?0}")
    List<Tache> findByManagerId(String managerId);
    
    @Query("{'membre.equipe.manager.id': ?0, 'statut': ?1}")
    List<Tache> findByManagerIdAndStatut(String managerId, StatutTache status);
}
