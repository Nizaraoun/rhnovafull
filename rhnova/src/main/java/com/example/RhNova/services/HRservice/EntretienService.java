package com.example.RhNova.services.HRservice;

import com.example.RhNova.dto.Entretiendto;
import com.example.RhNova.dto.CreateEntretienDto;
import com.example.RhNova.dto.CandidatSimpleDto;
import com.example.RhNova.model.enums.StatutEntretien;
import com.example.RhNova.model.enums.TypeEntretien;
import com.example.RhNova.model.enums.StatutCandidature;

import java.time.LocalDate;
import java.util.List;

public interface EntretienService {
    Entretiendto create(CreateEntretienDto dto, String responsableRHId);
    Entretiendto update(String id, CreateEntretienDto dto);
    void delete(String id);
    List<Entretiendto> getAll();
    Entretiendto getById(String id);
    List<Entretiendto> getByDate(LocalDate date);
    List<Entretiendto> getByDateRange(LocalDate startDate, LocalDate endDate);
    List<Entretiendto> getByStatut(StatutEntretien statut);
    List<Entretiendto> getByType(TypeEntretien type);
    List<Entretiendto> getByCandidatureId(String candidatureId);
    List<Entretiendto> getByResponsableRH(String responsableRHId);
    List<CandidatSimpleDto> getAvailableCandidates();
    Entretiendto updateStatut(String id, StatutEntretien newStatut);
    Entretiendto addNote(String id, Double note, String commentaires);
    void updateCandidatureDecision(String entretienId, StatutCandidature decision);
    double getSeuilReussite();
    void setSeuilReussite(double seuil);
}

