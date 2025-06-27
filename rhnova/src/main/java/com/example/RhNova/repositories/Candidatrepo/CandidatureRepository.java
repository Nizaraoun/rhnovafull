package com.example.RhNova.repositories.Candidatrepo;

import com.example.RhNova.model.entity.Candidat.Candidature;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface CandidatureRepository extends MongoRepository<Candidature, String> {
    List<Candidature> findByCandidatId(String candidatId);
    List<Candidature> findByOffreId(String offreId);

    // Find candidatures by multiple offer IDs
    @Query("{ 'offre.$id': { $in: ?0 } }")
    List<Candidature> findByOffreIdIn(List<String> offreIds);

}