package com.example.RhNova.repositories.Candidatrepo;

import com.example.RhNova.model.entity.Candidat.Candidature;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CandidatureRepository extends MongoRepository<Candidature, String> {
    List<Candidature> findByCandidatId(String candidatId);
    List<Candidature> findByOffreId(String offreId);
}