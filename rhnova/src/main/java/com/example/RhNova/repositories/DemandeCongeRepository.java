package com.example.RhNova.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.RhNova.model.entity.DemandeConge;

public interface DemandeCongeRepository extends MongoRepository<DemandeConge, String> {
}
