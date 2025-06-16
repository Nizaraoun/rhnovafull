package com.example.RhNova.services.Candidatservice;

import com.example.RhNova.dto.Candidaturedto;
import java.util.List;

public interface CandidatureService {
    Candidaturedto createCandidature(Candidaturedto dto);
    List<Candidaturedto> getAllCandidatures();
    Candidaturedto getCandidatureById(String id);
    void deleteCandidature(String id);
    List<Candidaturedto> getCandidaturesByCandidatId(String candidatId);

}