package com.example.RhNova.repositories.Managerepo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.RhNova.model.entity.Manager.Equipe;

public interface EquipeRepository extends MongoRepository<Equipe, String> {
}