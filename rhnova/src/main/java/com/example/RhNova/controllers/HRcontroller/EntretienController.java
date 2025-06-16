package com.example.RhNova.controllers.HRcontroller;

import com.example.RhNova.dto.Entretiendto;
import com.example.RhNova.model.entity.ResponRH.Entretien;
import com.example.RhNova.services.HRservice.EntretienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.RhNova.repositories.HRrepo.EntretienRepository;
import com.example.RhNova.model.mappers.EntretienMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/entretiens")
@CrossOrigin("*")
public class EntretienController {

    @Autowired
    private EntretienService entretienService;

    @Autowired
    private EntretienRepository entretienRepository;


    @PostMapping
    public Entretiendto create(@RequestBody Entretiendto dto) {
        return entretienService.create(dto);
    }

    @PutMapping("/{id}")
    public Entretiendto update(@PathVariable String id, @RequestBody Entretiendto dto) {
        return entretienService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        entretienService.delete(id);
    }

    @GetMapping
    public List<Entretiendto> getFilteredEntretiens(
        @RequestParam(required = false) String date, //Ces paramètres sont optionnels (tu peux les envoyer ou non dans l’URL).
        @RequestParam(required = false) String candidatId,
        @RequestParam(required = false) String offreId
    ){
    List<Entretien> entretiens; //On crée une liste vide pour stocker les entretiens filtrés qu’on va récupérer selon les critères.

    if (date != null && candidatId != null) {
        // Convertir la date string vers LocalDateTime
        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.atTime(23, 59, 59);
        entretiens = entretienRepository.findByDateHeureBetweenAndCandidatId(startOfDay, endOfDay, candidatId);
    } else if (candidatId != null) {
        entretiens = entretienRepository.findByCandidatId(candidatId);
    } else if (offreId != null) {
        entretiens = entretienRepository.findByOffreId(offreId);
    } else {
        entretiens = entretienRepository.findAll();
    }

    return entretiens.stream() //→ Parcourt la liste
            .map(EntretienMapper::toDTO) //→ Applique le mapper
            .collect(Collectors.toList()); //→ Retourne une nouvelle liste de DTOs
    }


    @GetMapping("/{id}")
    public Entretiendto getById(@PathVariable String id) {
        return entretienService.getById(id);
    }
}

