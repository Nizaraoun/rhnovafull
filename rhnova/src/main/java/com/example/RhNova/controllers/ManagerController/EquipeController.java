package com.example.RhNova.controllers.ManagerController;

import com.example.RhNova.dto.Equipedto;
import com.example.RhNova.dto.userdto;
import com.example.RhNova.services.Managerservice.EquipeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipes")
@CrossOrigin(origins = "*") // Pour permettre les requêtes depuis Angular

public class EquipeController {

    private final EquipeService equipeService;

    public EquipeController(EquipeService equipeService) {
        this.equipeService = equipeService;
    }

    @PostMapping
    public ResponseEntity<Equipedto> createEquipe(@RequestBody Equipedto dto) {
        Equipedto created = equipeService.createEquipe(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Equipedto>> getAllEquipes() {
        return ResponseEntity.ok(equipeService.getAllEquipes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipedto> getEquipeById(@PathVariable String id) {
        return ResponseEntity.ok(equipeService.getEquipeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipedto> updateEquipe(@PathVariable String id, @RequestBody Equipedto dto) {
        Equipedto updated = equipeService.updateEquipe(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipe(@PathVariable String id) {
        equipeService.deleteEquipe(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{equipeId}/membres/{userId}")
    public ResponseEntity<Void> addMembreToEquipe(@PathVariable String equipeId, @PathVariable String userId) {
        equipeService.addMembreToEquipe(equipeId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{equipeId}/membres/{userId}")
    public ResponseEntity<Void> removeMembreFromEquipe(@PathVariable String equipeId, @PathVariable String userId) {
        equipeService.removeMembreFromEquipe(equipeId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{equipeId}/membres")
    public ResponseEntity<List<userdto>> getMembres(@PathVariable String equipeId) {
        List<userdto> membres = equipeService.getMembresByEquipeId(equipeId);
        return ResponseEntity.ok(membres);
    }


}