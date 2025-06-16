package com.example.RhNova.controllers;

import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.enums.StatutTache;
import com.example.RhNova.services.MembreService.*;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Pour permettre les requêtes depuis Angular
public class TacheController {

    private final TacheService tacheService;

    @PostMapping
    public Tachedto create(@RequestBody Tachedto dto) {
        return tacheService.createTache(dto);
    }

    @PutMapping("/{id}")
    public Tachedto update(@PathVariable String id, @RequestBody Tachedto dto) {
        return tacheService.updateTache(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        tacheService.deleteTache(id);
    }

    @GetMapping
    public List<Tachedto> getAll() {
        return tacheService.getAllTaches();
    }

    @GetMapping("/{id}")
    public Tachedto getOne(@PathVariable String id) {
        return tacheService.getTacheById(id);
    }

    @GetMapping("/membre/{membreId}")
    public List<Tachedto> getByMembre(@PathVariable String membreId) {
        return tacheService.getTachesByMembre(membreId);
    }

    @GetMapping("/equipe/{equipeId}")
    public List<Tachedto> getByEquipe(@PathVariable String equipeId) {
        return tacheService.getTachesByEquipe(equipeId);
    }

    @GetMapping("/filter")
    public List<Tachedto> filterTaches(@RequestParam StatutTache statut, @RequestParam String priorite) {
        return tacheService.filterTaches(statut, priorite);
    }

    @PatchMapping("/{id}/statut")
    public Tachedto updateStatut(@PathVariable String id, @RequestParam StatutTache statut) {
        return tacheService.updateStatut(id, statut);
    }

    @PatchMapping("/{id}/progression")
    public Tachedto updateProgression(@PathVariable String id, @RequestParam Integer progression) {
        return tacheService.updateProgression(id, progression);
    }

    @PatchMapping("/{id}/evaluation")
    public Tachedto updateEvaluation(@PathVariable String id, @RequestParam Integer evaluation) {
        return tacheService.updateEvaluation(id, evaluation);
    }

}
