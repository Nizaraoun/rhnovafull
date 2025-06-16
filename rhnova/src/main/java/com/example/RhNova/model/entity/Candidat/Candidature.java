package com.example.RhNova.model.entity.Candidat;

import java.time.LocalDate;

import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.ResponRH.JobOffer;
import com.example.RhNova.model.enums.StatutCandidature;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

@Document(collection = "candidatures")
@Data
public class Candidature {

    @Id
    private String id;

    private LocalDate dateCandidature;

    private StatutCandidature statut;

    @DBRef
    private User candidat;

    @DBRef
    private JobOffer offre;

    @DBRef
    private Profil profil; 
}
