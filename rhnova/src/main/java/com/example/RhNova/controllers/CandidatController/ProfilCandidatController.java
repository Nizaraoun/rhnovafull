package com.example.RhNova.controllers.CandidatController;

import com.example.RhNova.model.entity.Candidat.Profil;
import com.example.RhNova.services.Candidatservice.ProfilCandidatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/profil")
@CrossOrigin(origins = "http://localhost:4200")
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

    // ✅ GET : récupération de l'image à partir d'une URL
    @GetMapping("/image")
    public ResponseEntity<byte[]> getImageByUrl(@RequestParam("url") String url) {
        try {
            // Nettoyer l'URL si elle commence par "/"
            String cleanUrl = url.startsWith("/") ? url.substring(1) : url;

            Path imagePath = Paths.get(cleanUrl);
            
            if (!Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] imageData = Files.readAllBytes(imagePath);
            
            // Déterminer le type MIME basé sur l'extension du fichier
            String fileName = imagePath.getFileName().toString().toLowerCase();
            MediaType mediaType = MediaType.IMAGE_JPEG; // Par défaut
            
            if (fileName.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (fileName.endsWith(".webp")) {
                mediaType = MediaType.valueOf("image/webp");
            } else if (fileName.endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentLength(imageData.length);
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ GET : vérifier si l'utilisateur a une photo de profil
    @GetMapping("/{userId}/has-photo")
    public ResponseEntity<Boolean> hasProfilePicture(@PathVariable String userId) {
        boolean hasPhoto = service.hasProfilePicture(userId);
        return ResponseEntity.ok(hasPhoto);
    }
}
