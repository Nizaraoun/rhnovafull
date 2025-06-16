package com.example.RhNova.repositories.Candidatrepo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.RhNova.model.entity.Candidat.Profil;

public interface ProfilCandidatRepository extends MongoRepository<Profil, String> {
}