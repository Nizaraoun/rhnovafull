package com.example.RhNova.controllers.CandidatController;

import com.example.RhNova.dto.userdto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Candidat.Candidature;
import com.example.RhNova.model.mappers.UserMapper;
import com.example.RhNova.services.Candidatservice.CandidatService;
import com.example.RhNova.repositories.Candidatrepo.CandidatureRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidats")
@CrossOrigin(origins = "http://localhost:4200")

public class CandidatController {

    @Autowired
    private CandidatService candidatService;

    @Autowired
    private CandidatureRepository candidatureRepository;


    @GetMapping
    public List<userdto> getAllCandidats() {
        List<User> candidats = candidatService.getAllCandidats();
        return candidats.stream().map(UserMapper::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public userdto getCandidatById(@PathVariable String id) {
        User candidat = candidatService.getCandidatById(id);
        return UserMapper.toDTO(candidat);
    }

    // obtenir les candidats liés à une offre
    @GetMapping("/offre/{offreId}")
    public List<userdto> getCandidatsByOffreId(@PathVariable String offreId) {
        return candidatureRepository.findByOffreId(offreId).stream()
                .map(Candidature::getCandidat)
                .distinct()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

}
