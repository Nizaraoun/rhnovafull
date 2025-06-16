package com.example.RhNova.services.HRservice;

import com.example.RhNova.dto.Entretiendto;
import com.example.RhNova.model.entity.ResponRH.Entretien;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.ResponRH.JobOffer;
import com.example.RhNova.model.mappers.EntretienMapper;
import com.example.RhNova.repositories.HRrepo.EntretienRepository;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.HRrepo.JobOfferRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntretienServiceImpl implements EntretienService {

    @Autowired
    private EntretienRepository entretienRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Override
    public Entretiendto create(Entretiendto dto) {
        Entretien entretien = EntretienMapper.toEntity(dto);

        User candidat = userRepository.findById(dto.getCandidatId())
                .orElseThrow(() -> new RuntimeException("Candidat non trouvé"));
        JobOffer offre = jobOfferRepository.findById(dto.getOffreId())
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        entretien.setCandidat(candidat);
        entretien.setOffre(offre);

        return EntretienMapper.toDTO(entretienRepository.save(entretien));
    }

    @Override
    public Entretiendto update(String id, Entretiendto dto) {
        Entretien entretien = entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));

        entretien.setDateHeure(dto.getDateHeure());
        entretien.setLieu(dto.getLieu());
        entretien.setInformationsComplementaires(dto.getInformationsComplementaires());

        return EntretienMapper.toDTO(entretienRepository.save(entretien));
    }

    @Override
    public void delete(String id) {
        entretienRepository.deleteById(id);
    }

    @Override
    public List<Entretiendto> getAll() {
        return entretienRepository.findAll().stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Entretiendto getById(String id) {
        Entretien entretien = entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));
        return EntretienMapper.toDTO(entretien);
    }
}

