package com.example.RhNova.services.HRservice;

import com.example.RhNova.model.entity.ResponRH.JobOffer;
import com.example.RhNova.repositories.HRrepo.JobOfferRepository;
import com.example.RhNova.specifications.JobOfferCriteriaBuilder;
import com.example.RhNova.util.AuthUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;

import com.example.RhNova.model.enums.Jobtype;

import java.util.List;


@Service
public class JobOfferService {
    
    private final JobOfferRepository jobOfferRepository;
    private final MongoTemplate mongoTemplate;
    private final AuthUtil authUtil;
    
    @Autowired
    public JobOfferService(JobOfferRepository jobOfferRepository, MongoTemplate mongoTemplate, AuthUtil authUtil) {
        this.jobOfferRepository = jobOfferRepository;
        this.mongoTemplate = mongoTemplate;
        this.authUtil = authUtil;
    }
    
    public JobOffer addJobOffer(JobOffer offer) {
        // Set the ID of the HR responsible who created this job offer
        String currentUserId = authUtil.getCurrentUserId();
        if (currentUserId != null) {
            offer.setCreatedByHrId(currentUserId);
        }
        return jobOfferRepository.save(offer);
    }
    
    public Page<JobOffer> getAllOffers(int page, int size) {
        return jobOfferRepository.findAll(PageRequest.of(page, size));
    }
    
    public JobOffer getOfferById(String id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));
    }
    
    
    public JobOffer updateOffer(String id, JobOffer updatedOffer) {
        JobOffer offer = getOfferById(id);
    
        offer.setTitre(updatedOffer.getTitre());
        offer.setDescription(updatedOffer.getDescription());
        offer.setLocalisation(updatedOffer.getLocalisation());
        offer.setPosition(updatedOffer.getPosition());
        offer.setExperience(updatedOffer.getExperience());
        offer.setDatePublication(updatedOffer.getDatePublication());
        offer.setDerniereDatePourPostuler(updatedOffer.getDerniereDatePourPostuler());
        offer.setSalaire(updatedOffer.getSalaire());
        offer.setCompetencesRequises(updatedOffer.getCompetencesRequises());
        offer.setTags(updatedOffer.getTags());
        offer.setTypedemploi(updatedOffer.getTypedemploi());
    
        return jobOfferRepository.save(offer);
    }
    
    
    public void deleteOffer(String id) {
        jobOfferRepository.deleteById(id);
    }


    public JobOffer archiveOffer(String id) {
    JobOffer offer = getOfferById(id);
    offer.setArchived(true);
    return jobOfferRepository.save(offer);
    }

    public Page<JobOffer> getFilteredOffers(String titre, String localisation, Jobtype type, Pageable pageable) {
        Query query = new Query();
        
        // Build criteria using the criteria builder
        Criteria filterCriteria = JobOfferCriteriaBuilder.buildFilterCriteria(titre, localisation, type, false);
        query.addCriteria(filterCriteria);
        
        // Apply pagination
        query.with(pageable);
        
        // Execute query
        List<JobOffer> jobOffers = mongoTemplate.find(query, JobOffer.class);
        
        // Count total elements for pagination
        Query countQuery = Query.of(query).limit(-1).skip(-1);
        long total = mongoTemplate.count(countQuery, JobOffer.class);
        
        return PageableExecutionUtils.getPage(jobOffers, pageable, () -> total);
    }
    
    /**
     * Get all active (non-archived) job offers with pagination
     */
    public Page<JobOffer> getAllActiveOffers(Pageable pageable) {
        return jobOfferRepository.findAllNonArchived(pageable);
    }
    
    /**
     * Get job offers by type
     */
    public List<JobOffer> getOffersByType(Jobtype type) {
        return jobOfferRepository.findByTypedemploi(type);
    }
    
    /**
     * Search job offers by title
     */
    public List<JobOffer> searchOffersByTitle(String titre) {
        return jobOfferRepository.findByTitreContainingIgnoreCaseAndNotArchived(titre);
    }
    
    /**
     * Search job offers by location
     */
    public List<JobOffer> searchOffersByLocation(String localisation) {
        return jobOfferRepository.findByLocalisationContainingIgnoreCaseAndNotArchived(localisation);
    }
    
    /**
     * Get job offers created by a specific HR user
     */
    public List<JobOffer> getOffersByHrId(String hrId) {
        return jobOfferRepository.findByCreatedByHrId(hrId);
    }
    
    /**
     * Get job offers created by the current authenticated HR user
     */
    public List<JobOffer> getOffersByCurrentHr() {
        String currentUserId = authUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return jobOfferRepository.findByCreatedByHrId(currentUserId);
    }

}