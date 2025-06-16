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
    List<Tache> findByStatut(StatutTache statut);
    @Query("{'membre.equipe.id': ?0}")
    List<Tache> findByMembre_Equipe_Id(String equipeId);
    List<Tache> findByStatutAndPriorite(StatutTache statut, Priorite priorite);
}
