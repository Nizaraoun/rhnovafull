package com.example.RhNova.repositories.HRrepo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.RhNova.model.entity.ResponRH.JobOffer;
import com.example.RhNova.model.enums.Jobtype;

import java.util.List;

public interface JobOfferRepository extends MongoRepository<JobOffer, String> {
    
    // Find all non-archived offers
    @Query("{'archived': {$ne: true}}")
    Page<JobOffer> findAllNonArchived(Pageable pageable);
    
    // Find offers by type
    List<JobOffer> findByTypedemploi(Jobtype typedemploi);
    
    // Find offers by location (case-insensitive)
    @Query("{'localisation': {$regex: ?0, $options: 'i'}, 'archived': {$ne: true}}")
    List<JobOffer> findByLocalisationContainingIgnoreCaseAndNotArchived(String localisation);
    
    // Find offers by title (case-insensitive)
    @Query("{'titre': {$regex: ?0, $options: 'i'}, 'archived': {$ne: true}}")
    List<JobOffer> findByTitreContainingIgnoreCaseAndNotArchived(String titre);
    
    // Find all non-archived offers (without pagination)
    @Query("{'archived': {$ne: true}}")
    List<JobOffer> findAllNonArchived();
    
    // Find job offers by HR ID
    List<JobOffer> findByCreatedByHrId(String hrId);

}

