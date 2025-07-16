package com.example.RhNova.services.Candidatservice;

import com.example.RhNova.dto.Candidaturedto;
import com.example.RhNova.dto.DetailedCandidatureDto;
import java.util.List;

public interface CandidatureService {
    Candidaturedto createCandidature(Candidaturedto dto);
    List<Candidaturedto> getAllCandidatures();
    Candidaturedto getCandidatureById(String id);
    void deleteCandidature(String id);
    Candidaturedto updateCandidatureProcessedStatus(String id, boolean isProcessed); // New update method
    Candidaturedto updateCandidatureProcessedStatusByCandidatAndOffre(String candidatId, String offreId, boolean isProcessed); // New method
    List<Candidaturedto> getCandidaturesByCandidatId(String candidatId);
    List<Candidaturedto> getCandidaturesByOffreId(String offreId);
    List<Candidaturedto> getCandidaturesByRHId(String rhId);
    
    // Enhanced methods with detailed information
    List<DetailedCandidatureDto> getDetailedCandidaturesByRHId(String rhId);
    List<DetailedCandidatureDto> getDetailedCandidaturesByOffreId(String offreId);
}