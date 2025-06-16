package com.example.RhNova.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Entretiendto {
    private String id;
    private String candidatId;
    private String candidatNom;
    private String offreId;
    private String titreOffre;
    private LocalDateTime dateHeure;
    private String lieu;
    private String informationsComplementaires;
    
}
