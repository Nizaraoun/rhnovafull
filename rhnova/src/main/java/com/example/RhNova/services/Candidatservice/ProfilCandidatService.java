package com.example.RhNova.services.Candidatservice;

import com.example.RhNova.model.entity.Candidat.Profil;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.repositories.Candidatrepo.ProfilCandidatRepository;
import com.example.RhNova.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class ProfilCandidatService {

    private static final String UPLOAD_DIR = "uploads/profil_photos/";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfilCandidatRepository profilRepository;

    public Profil createOrUpdate(String userId, Profil profilData) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.getRole() != Role.CANDIDAT) {
            throw new RuntimeException("L'utilisateur n'est pas un candidat");
        }

        profilData.setCandidat(user);
        profilData.setId(userId); // S'assurer que l'ID est bien celui du user
        return profilRepository.save(profilData);
    }

    public Profil getProfil(String userId) {
        return profilRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Profil non trouvé"));
    }

    // ✅ Mise à jour d’un profil existant
    public Profil updateProfil(String userId, Profil newData) {
        Profil existing = getProfil(userId);

        existing.setDateDeNaissance(newData.getDateDeNaissance());
        existing.setVille(newData.getVille());
        existing.setPays(newData.getPays());
        existing.setCodePostal(newData.getCodePostal());
        existing.setProfession(newData.getProfession());
        existing.setFormations(newData.getFormations());
        existing.setExperiences(newData.getExperiences());
        existing.setCompetences(newData.getCompetences());
        existing.setLangues(newData.getLangues());
        existing.setCertifications(newData.getCertifications());
        existing.setProjets(newData.getProjets());
        existing.setDescription(newData.getDescription());

        return profilRepository.save(existing);
    }

    // ✅ Upload de photo de profil
    public String saveProfilePicture(String userId, MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new RuntimeException("Fichier vide");

        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = filename.substring(filename.lastIndexOf('.'));
        String newFilename = "profil_" + userId + extension;

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // ✅ Affiche dans la console où l'image est stockée
        System.out.println("Image enregistrée à : " + filePath.toAbsolutePath());


        // Mise à jour de l'URL dans le profil
        Profil profil = getProfil(userId);
        profil.setPhoto("/" + UPLOAD_DIR + newFilename); // ou une URL complète si hébergée ailleurs
        profilRepository.save(profil);

        return profil.getPhoto();
    }
}
