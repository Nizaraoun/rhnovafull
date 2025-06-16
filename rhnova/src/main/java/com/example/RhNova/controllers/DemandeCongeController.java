package com.example.RhNova.controllers;

import com.example.RhNova.dto.DemandeCongedto;
import com.example.RhNova.model.entity.DemandeConge;
import com.example.RhNova.services.DemandeCongeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conges")
public class DemandeCongeController {

    private final DemandeCongeService congeService;

    @Autowired
    public DemandeCongeController(DemandeCongeService congeService) {
        this.congeService = congeService;
    }

   
    @PostMapping("/create")
    public DemandeConge create(@RequestBody DemandeCongedto dto) {
        return congeService.createDemande(dto);
    }

    @GetMapping("/all")
    public List<DemandeConge> getAll() {
        return congeService.getAll();
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable String id) {
        congeService.deleteById(id);
    }
}
