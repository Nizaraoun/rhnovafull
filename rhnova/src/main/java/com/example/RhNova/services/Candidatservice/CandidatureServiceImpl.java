package com.example.RhNova.services.Candidatservice;

import com.example.RhNova.dto.Candidaturedto;
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

    private Candidaturedto convertToDTO(Candidature c) {
        Candidaturedto dto = new Candidaturedto();
        dto.setId(c.getId());
        dto.setDateCandidature(c.getDateCandidature());
        dto.setStatut(c.getStatut());
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

}