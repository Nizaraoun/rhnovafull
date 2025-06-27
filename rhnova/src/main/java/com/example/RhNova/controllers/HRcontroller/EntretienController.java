package com.example.RhNova.controllers.HRcontroller;

import com.example.RhNova.dto.Entretiendto;
import com.example.RhNova.dto.CreateEntretienDto;
import com.example.RhNova.dto.CandidatSimpleDto;
import com.example.RhNova.model.enums.StatutEntretien;
import com.example.RhNova.model.enums.TypeEntretien;
import com.example.RhNova.model.enums.StatutCandidature;
import com.example.RhNova.services.HRservice.EntretienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entretiens")
@CrossOrigin("*")
public class EntretienController {

    @Autowired
    private EntretienService entretienService;

    @PostMapping
    public ResponseEntity<Entretiendto> create(@RequestBody CreateEntretienDto dto, Principal principal) {
        try {
            System.out.println("Creating entretien for user: " + (principal != null ? principal.getName() : "anonymous"));
            // Get the HR responsible ID from the authenticated user
            String responsableRHId = principal != null ? principal.getName() : "default-hr-id";
            Entretiendto entretien = entretienService.create(dto, responsableRHId);
            return ResponseEntity.ok(entretien);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entretiendto> update(@PathVariable String id, @RequestBody CreateEntretienDto dto) {
        try {
            Entretiendto entretien = entretienService.update(id, dto);
            return ResponseEntity.ok(entretien);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            entretienService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Entretiendto>> getAll() {
        List<Entretiendto> entretiens = entretienService.getAll();
        return ResponseEntity.ok(entretiens);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entretiendto> getById(@PathVariable String id) {
        try {
            Entretiendto entretien = entretienService.getById(id);
            return ResponseEntity.ok(entretien);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Entretiendto>> getByDate(@PathVariable String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<Entretiendto> entretiens = entretienService.getByDate(localDate);
            return ResponseEntity.ok(entretiens);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Entretiendto>> getByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<Entretiendto> entretiens = entretienService.getByDateRange(start, end);
            return ResponseEntity.ok(entretiens);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Entretiendto>> getByStatut(@PathVariable StatutEntretien statut) {
        List<Entretiendto> entretiens = entretienService.getByStatut(statut);
        return ResponseEntity.ok(entretiens);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Entretiendto>> getByType(@PathVariable TypeEntretien type) {
        List<Entretiendto> entretiens = entretienService.getByType(type);
        return ResponseEntity.ok(entretiens);
    }

    @GetMapping("/candidature/{candidatureId}")
    public ResponseEntity<List<Entretiendto>> getByCandidature(@PathVariable String candidatureId) {
        List<Entretiendto> entretiens = entretienService.getByCandidatureId(candidatureId);
        return ResponseEntity.ok(entretiens);
    }

    @GetMapping("/responsable/{responsableRHId}")
    public ResponseEntity<List<Entretiendto>> getByResponsableRH(@PathVariable String responsableRHId) {
        List<Entretiendto> entretiens = entretienService.getByResponsableRH(responsableRHId);
        return ResponseEntity.ok(entretiens);
    }

    @GetMapping("/candidates/available")
    public ResponseEntity<List<CandidatSimpleDto>> getAvailableCandidates() {
        List<CandidatSimpleDto> candidates = entretienService.getAvailableCandidates();
        return ResponseEntity.ok(candidates);
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<Entretiendto> updateStatut(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        try {
            StatutEntretien newStatut = StatutEntretien.valueOf(payload.get("statut"));
            Entretiendto entretien = entretienService.updateStatut(id, newStatut);
            return ResponseEntity.ok(entretien);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/note")
    public ResponseEntity<Entretiendto> addNote(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        try {
            Double note = payload.get("note") != null ? 
                Double.valueOf(payload.get("note").toString()) : null;
            String commentaires = (String) payload.get("commentaires");
            
            Entretiendto entretien = entretienService.addNote(id, note, commentaires);
            return ResponseEntity.ok(entretien);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/decision")
    public ResponseEntity<Void> updateCandidatureDecision(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        try {
            StatutCandidature decision = StatutCandidature.valueOf(payload.get("decision"));
            entretienService.updateCandidatureDecision(id, decision);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Additional endpoint to get filtered entretiens (backward compatibility)
    @GetMapping("/filter")
    public ResponseEntity<List<Entretiendto>> getFilteredEntretiens(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String candidatureId,
            @RequestParam(required = false) String responsableRHId) {
        
        try {
            if (date != null) {
                LocalDate localDate = LocalDate.parse(date);
                return ResponseEntity.ok(entretienService.getByDate(localDate));
            } else if (candidatureId != null) {
                return ResponseEntity.ok(entretienService.getByCandidatureId(candidatureId));
            } else if (responsableRHId != null) {
                return ResponseEntity.ok(entretienService.getByResponsableRH(responsableRHId));
            } else {
                return ResponseEntity.ok(entretienService.getAll());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/threshold")
    public ResponseEntity<Map<String, Double>> getSeuilReussite() {
        double seuil = entretienService.getSeuilReussite();
        Map<String, Double> response = Map.of("seuilReussite", seuil);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/threshold")
    public ResponseEntity<Map<String, String>> setSeuilReussite(@RequestBody Map<String, Double> payload) {
        try {
            Double newSeuil = payload.get("seuilReussite");
            if (newSeuil == null) {
                return ResponseEntity.badRequest().build();
            }
            entretienService.setSeuilReussite(newSeuil);
            Map<String, String> response = Map.of("message", "Seuil de réussite mis à jour avec succès");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = Map.of("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

