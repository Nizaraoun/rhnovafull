package com.example.RhNova.model.entity.Candidat;

import com.example.RhNova.model.entity.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "profils")
@Data
public class Profil {

    @Id
    private String id;

    @DBRef
    private User candidat;

    private LocalDate dateDeNaissance;
    private String ville;
    private String pays;
    private String codePostal;
    private String phoneNumber; // Numéro de téléphone
    private String photo; // URL ou base64

    private String profession;

    private List<String> formations;

    private List<String> experiences;

    private List<String> competences;

    private List<String> langues;

    private List<String> certifications;

    private List<String> projets;

    private String description;
}
