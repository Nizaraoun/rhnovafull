package com.example.RhNova.services.Candidatservice;

import com.example.RhNova.dto.Candidaturedto;
import com.example.RhNova.dto.DetailedCandidatureDto;
import com.example.RhNova.model.entity.Candidat.Candidature;
import com.example.RhNova.model.entity.Candidat.Profil;
import com.example.RhNova.model.entity.ResponRH.JobOffer;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.repositories.Candidatrepo.CandidatureRepository;
import com.example.RhNova.repositories.Candidatrepo.ProfilCandidatRepository;
import com.example.RhNova.repositories.HRrepo.JobOfferRepository;
import com.example.RhNova.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class CandidatureServiceImpl implements CandidatureService {

    @Autowired private CandidatureRepository candidatureRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JobOfferRepository jobOfferRepository;
    @Autowired private ProfilCandidatRepository profilRepository;

    @Override
    public Candidaturedto createCandidature(Candidaturedto dto) {
        Candidature candidature = new Candidature();
        candidature.setDateCandidature(dto.getDateCandidature());
        candidature.setStatut(dto.getStatut());
        candidature.setProcessed(dto.isProcessed()); // Set the boolean field

        User candidat = userRepository.findById(dto.getCandidatId()).orElseThrow();
        JobOffer offre = jobOfferRepository.findById(dto.getOffreId()).orElseThrow();
        Profil profil = profilRepository.findById(dto.getProfilId()).orElseThrow();

        candidature.setCandidat(candidat);
        candidature.setOffre(offre);
        candidature.setProfil(profil);

        candidature = candidatureRepository.save(candidature);
        dto.setId(candidature.getId());
        return dto;
    }

    @Override
    public List<Candidaturedto> getAllCandidatures() {
        return candidatureRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public Candidaturedto getCandidatureById(String id) {
        return candidatureRepository.findById(id).map(this::convertToDTO).orElse(null);
    }

    @Override
    public void deleteCandidature(String id) {
        candidatureRepository.deleteById(id);
    }

    @Override
    public Candidaturedto updateCandidatureProcessedStatus(String id, boolean isProcessed) {
        Candidature candidature = candidatureRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidature not found with id: " + id));
        
        candidature.setProcessed(isProcessed);
        candidature = candidatureRepository.save(candidature);
        
        return convertToDTO(candidature);
    }

    @Override
    public Candidaturedto updateCandidatureProcessedStatusByCandidatAndOffre(String candidatId, String offreId, boolean isProcessed) {
        Candidature candidature = candidatureRepository.findByCandidatIdAndOffreId(candidatId, offreId);
        if (candidature == null) {
            throw new RuntimeException("Candidature not found with candidatId: " + candidatId + " and offreId: " + offreId);
        }
        
        candidature.setProcessed(isProcessed);
        candidature = candidatureRepository.save(candidature);
        
        return convertToDTO(candidature);
    }

    private Candidaturedto convertToDTO(Candidature c) {
        Candidaturedto dto = new Candidaturedto();
        dto.setId(c.getId());
        dto.setDateCandidature(c.getDateCandidature());
        dto.setStatut(c.getStatut());
        dto.setProcessed(c.isProcessed()); // Add the boolean field
        dto.setCandidatId(c.getCandidat().getId());
        dto.setOffreId(c.getOffre().getId());
        dto.setProfilId(c.getProfil().getId());
        return dto;
    }

    @Override
    public List<Candidaturedto> getCandidaturesByCandidatId(String candidatId) {
        return candidatureRepository.findByCandidatId(candidatId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<Candidaturedto> getCandidaturesByOffreId(String offreId) {
        return candidatureRepository.findByOffreId(offreId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<Candidaturedto> getCandidaturesByRHId(String rhId) {
        // First, find all job offers created by this HR
        List<JobOffer> jobOffers = jobOfferRepository.findByCreatedByHrId(rhId);
        
        // Extract the IDs of these job offers
        List<String> offerIds = jobOffers.stream()
            .map(JobOffer::getId)
            .collect(Collectors.toList());
        
        // Find all candidatures for these job offers
        if (offerIds.isEmpty()) {
            return List.of(); // Return empty list if HR has no job offers
        }
        
        // Use individual queries instead of $in operator
        List<Candidature> allCandidatures = new ArrayList<>();
        for (String offerId : offerIds) {
            allCandidatures.addAll(candidatureRepository.findByOffreId(offerId));
        }
        
        return allCandidatures.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<DetailedCandidatureDto> getDetailedCandidaturesByRHId(String rhId) {
        // First, find all job offers created by this HR
        List<JobOffer> jobOffers = jobOfferRepository.findByCreatedByHrId(rhId);
        
        // Extract the IDs of these job offers
        List<String> offerIds = jobOffers.stream()
            .map(JobOffer::getId)
            .collect(Collectors.toList());
        
        // Find all candidatures for these job offers
        if (offerIds.isEmpty()) {
            return List.of(); // Return empty list if HR has no job offers
        }
        
        // Use individual queries instead of $in operator
        List<Candidature> allCandidatures = new ArrayList<>();
        for (String offerId : offerIds) {
            allCandidatures.addAll(candidatureRepository.findByOffreId(offerId));
        }
        
        return allCandidatures.stream()
            .filter(candidature -> candidature.isProcessed()) // Only return processed candidatures
            .map(this::convertToDetailedDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<DetailedCandidatureDto> getDetailedCandidaturesByOffreId(String offreId) {
        return candidatureRepository.findByOffreId(offreId)
            .stream()
            .map(this::convertToDetailedDTO)
            .collect(Collectors.toList());
    }

    private DetailedCandidatureDto convertToDetailedDTO(Candidature c) {
        DetailedCandidatureDto dto = new DetailedCandidatureDto();
        
        // Basic candidature info
        dto.setId(c.getId());
        dto.setDateCandidature(c.getDateCandidature());
        dto.setStatut(c.getStatut());
        dto.setCandidatId(c.getCandidat().getId());
        dto.setOffreId(c.getOffre().getId());
        dto.setProfilId(c.getProfil().getId());
        
        // Candidate basic info
        dto.setCandidatNom(c.getCandidat().getName());
        dto.setCandidatEmail(c.getCandidat().getEmail());
        dto.setCandidatRole(c.getCandidat().getRole());
        
        // Job offer info
        dto.setOffreTitre(c.getOffre().getTitre());
        dto.setOffreDescription(c.getOffre().getDescription());
        dto.setOffreLocalisation(c.getOffre().getLocalisation());
        
        // Profile detailed info
        if (c.getProfil() != null) {
            dto.setDateDeNaissance(c.getProfil().getDateDeNaissance());
            dto.setVille(c.getProfil().getVille());
            dto.setPays(c.getProfil().getPays());
            dto.setCodePostal(c.getProfil().getCodePostal());
            dto.setPhoneNumber(c.getProfil().getPhoneNumber());
            dto.setPhoto(c.getProfil().getPhoto());
            dto.setProfession(c.getProfil().getProfession());
            dto.setFormations(c.getProfil().getFormations());
            dto.setExperiences(c.getProfil().getExperiences());
            dto.setCompetences(c.getProfil().getCompetences());
            dto.setLangues(c.getProfil().getLangues());
            dto.setCertifications(c.getProfil().getCertifications());
            dto.setProjets(c.getProfil().getProjets());
            dto.setDescription(c.getProfil().getDescription());
        }
        
        return dto;
    }

}