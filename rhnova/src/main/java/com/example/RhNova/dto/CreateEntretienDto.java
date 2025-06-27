package com.example.RhNova.dto;

import com.example.RhNova.model.enums.TypeEntretien;
import com.example.RhNova.model.enums.StatutEntretien;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEntretienDto {
    
    private String candidatureId;
    
    private LocalDate dateEntretien;
    
    private LocalTime heureEntretien;
    
    private Integer dureeMinutes = 60;
    
    private TypeEntretien type = TypeEntretien.TECHNIQUE;
    
    private StatutEntretien statut = StatutEntretien.PLANIFIE;
    
    private String lieu;
    
    private String lienVisio;
    
    private String objectifs;
    
    private String commentaires;
    
    private Double note;
}
