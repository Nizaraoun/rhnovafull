package com.example.RhNova.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DetailedEquipeDto {
    private String id;
    private String nom;
    private String description;
    private userdto manager;
    private List<userdto> membres;
    private int nombreMembres;
}
