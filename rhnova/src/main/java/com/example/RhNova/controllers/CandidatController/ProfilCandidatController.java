package com.example.RhNova.controllers.CandidatController;

import com.example.RhNova.model.entity.Candidat.Profil;
import com.example.RhNova.services.Candidatservice.ProfilCandidatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profil")
@CrossOrigin("*")
public class ProfilCandidatController {

    @Autowired
    private ProfilCandidatService service;

    // POST : création ou mise à jour initiale
    @PostMapping("/{userId}")
    public ResponseEntity<Profil> saveOrUpdateProfil(@PathVariable String userId, @RequestBody Profil profil) {
        return ResponseEntity.ok(service.createOrUpdate(userId, profil));
    }

    // GET : lecture du profil
    @GetMapping("/{userId}")
    public ResponseEntity<Profil> getProfil(@PathVariable String userId) {
        return ResponseEntity.ok(service.getProfil(userId));
    }

    // ✅ PUT : mise à jour partielle
    @PutMapping("/{userId}")
    public ResponseEntity<Profil> updateProfil(@PathVariable String userId, @RequestBody Profil profil) {
        return ResponseEntity.ok(service.updateProfil(userId, profil));
    }

    // ✅ Upload photo de profil
    @PostMapping("/{userId}/upload-photo")
    public ResponseEntity<String> uploadProfilePicture(@PathVariable String userId, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = service.saveProfilePicture(userId, file);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload : " + e.getMessage());
        }
    }
}
