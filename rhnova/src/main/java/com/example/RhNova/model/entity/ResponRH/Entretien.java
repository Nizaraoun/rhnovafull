package com.example.RhNova.model.entity.ResponRH;

import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Candidat.Candidature;
import com.example.RhNova.model.enums.TypeEntretien;
import com.example.RhNova.model.enums.StatutEntretien;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Document(collection = "entretiens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entretien {

    @Id
    private String id;

    @DBRef
    private Candidature candidature;

    private LocalDate dateEntretien;

    private LocalTime heureEntretien;

    private Integer dureeMinutes;

    private TypeEntretien type;

    private StatutEntretien statut;

    private String lieu;

    private String lienVisio;

    private String objectifs;

    private String commentaires;

    private Double note; // Note sur 20

    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;

    @DBRef
    private User responsableRH;
}
