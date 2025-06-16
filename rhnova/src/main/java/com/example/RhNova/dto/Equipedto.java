package com.example.RhNova.dto;

import lombok.Data;

import java.util.List;

@Data
public class Equipedto {
    private String id;
    private String nom;
    private String description;
    private String managerId;
    private List<String> membreIds;
}
