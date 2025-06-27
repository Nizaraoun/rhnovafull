package com.example.RhNova.model.entity.ResponRH;

import com.example.RhNova.model.enums.Jobtype;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "job_offers")
@Data
public class JobOffer {
    
    @Id
    private String id;

    private String titre;
    private String description;
    private String localisation;
    private String position;
    private String experience;
    private LocalDate datePublication;
    private LocalDate derniereDatePourPostuler;
    private Float salaire;

    private List<String> competencesRequises;

    private List<String> tags;

    private Jobtype typedemploi;

    private boolean archived = false; // Par défaut non archivée

    private String createdByHrId; // ID of the HR who created this job offer

    
}
