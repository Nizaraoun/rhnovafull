package com.example.RhNova.repositories.HRrepo;

import com.example.RhNova.model.entity.ResponRH.Entretien;
import com.example.RhNova.model.enums.StatutEntretien;
import com.example.RhNova.model.enums.TypeEntretien;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EntretienRepository extends MongoRepository<Entretien, String> {

    List<Entretien> findByCandidatureId(String candidatureId);

    List<Entretien> findByCandidature_OffreId(String offreId);

    List<Entretien> findByDateEntretien(LocalDate date);

    List<Entretien> findByDateEntretienBetween(LocalDate startDate, LocalDate endDate);

    List<Entretien> findByStatut(StatutEntretien statut);

    List<Entretien> findByType(TypeEntretien type);

    List<Entretien> findByResponsableRHId(String responsableRHId);

    @Query("{'candidature.candidat.id': ?0}")
    List<Entretien> findByCandidatId(String candidatId);

    @Query("{'dateEntretien': ?0, 'statut': {$in: ['PLANIFIE', 'CONFIRME']}}")
    List<Entretien> findActiveEntretiensByDate(LocalDate date);

    @Query("{'candidature.candidat.id': ?0, 'statut': {$ne: 'ANNULE'}}")
    List<Entretien> findNonCancelledEntretiensByCandidatId(String candidatId);
}
