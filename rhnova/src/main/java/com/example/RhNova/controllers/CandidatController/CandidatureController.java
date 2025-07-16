package com.example.RhNova.controllers.CandidatController;

import com.example.RhNova.dto.Candidaturedto;
import com.example.RhNova.services.Candidatservice.CandidatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidatures")
@CrossOrigin(origins = "http://localhost:4200")
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

    @PutMapping("/candidat/{candidatId}/offre/{offreId}/processed")
    public Candidaturedto updateProcessedStatus(@PathVariable String candidatId, @PathVariable String offreId, @RequestParam boolean isProcessed) {
        return candidatureService.updateCandidatureProcessedStatusByCandidatAndOffre(candidatId, offreId, isProcessed);
    }

    @GetMapping("/candidat/{candidatId}")
    public List<Candidaturedto> getCandidaturesByCandidat(@PathVariable String candidatId) {
        return candidatureService.getCandidaturesByCandidatId(candidatId);
    }

    @GetMapping("/offre/{offreId}")
    public List<Candidaturedto> getCandidaturesByOffre(@PathVariable String offreId) {
        return candidatureService.getCandidaturesByOffreId(offreId);
    }

    @GetMapping("/rh/{rhId}")
    public List<Candidaturedto> getCandidaturesByRH(@PathVariable String rhId) {
        return candidatureService.getCandidaturesByRHId(rhId);
    }

  
}