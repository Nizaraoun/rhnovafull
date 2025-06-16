package com.example.RhNova.controllers.CandidatController;

import com.example.RhNova.dto.Candidaturedto;
import com.example.RhNova.services.Candidatservice.CandidatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidatures")
@CrossOrigin("*")
public class CandidatureController {

    @Autowired
    private CandidatureService candidatureService;

    @PostMapping
    public Candidaturedto create(@RequestBody Candidaturedto dto) {
        return candidatureService.createCandidature(dto);
    }

    @GetMapping
    public List<Candidaturedto> getAll() {
        return candidatureService.getAllCandidatures();
    }

    @GetMapping("/{id}")
    public Candidaturedto getById(@PathVariable String id) {
        return candidatureService.getCandidatureById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        candidatureService.deleteCandidature(id);
    }

    @GetMapping("/candidat/{candidatId}")
    public List<Candidaturedto> getCandidaturesByCandidat(@PathVariable String candidatId) {
        return candidatureService.getCandidaturesByCandidatId(candidatId);
    }

}