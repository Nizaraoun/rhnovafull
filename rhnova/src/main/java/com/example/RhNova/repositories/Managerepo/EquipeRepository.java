package com.example.RhNova.repositories.Managerepo;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

import com.example.RhNova.model.entity.Manager.Equipe;
import com.example.RhNova.model.entity.User;

public interface EquipeRepository extends MongoRepository<Equipe, String> {
    Optional<Equipe> findByManagerId(String managerId);
    List<Equipe> findAllByManagerId(String managerId);
    Equipe findByMembresContaining(User user);
}