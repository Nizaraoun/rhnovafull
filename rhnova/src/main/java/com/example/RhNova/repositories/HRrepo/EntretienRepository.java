package com.example.RhNova.repositories.HRrepo;

import com.example.RhNova.model.entity.ResponRH.Entretien;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntretienRepository extends MongoRepository<Entretien, String> {

    List<Entretien> findByCandidatId(String id);

    List<Entretien> findByOffreId(String id);

    List<Entretien> findByDateHeureBetweenAndCandidatId(LocalDateTime start, LocalDateTime end, String candidatId); // ✅


}
