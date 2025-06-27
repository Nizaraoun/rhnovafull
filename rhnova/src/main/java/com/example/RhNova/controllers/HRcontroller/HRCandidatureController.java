package com.example.RhNova.controllers.HRcontroller;

import com.example.RhNova.dto.Candidaturedto;
import com.example.RhNova.dto.DetailedCandidatureDto;
import com.example.RhNova.services.Candidatservice.CandidatureService;
import com.example.RhNova.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/hr/candidatures")
@CrossOrigin(origins = "http://localhost:4200")
public class HRCandidatureController {

    @Autowired
    private CandidatureService candidatureService;

    @Autowired
    private AuthUtil authUtil;    /**
     * Get all candidatures for a specific job offer - accessible to HR
     * @param offreId The ID of the job offer
     * @return List of candidatures for the specified job offer
     */
    @GetMapping("/job-offer/{offreId}")
    public List<Candidaturedto> getCandidaturesByJobOffer(@PathVariable String offreId) {
        return candidatureService.getCandidaturesByOffreId(offreId);
    }

    /**
     * Get detailed candidatures for a specific job offer - accessible to HR
     * @param offreId The ID of the job offer
     * @return List of detailed candidatures for the specified job offer
     */
    @GetMapping("/job-offer/{offreId}/detailed")
    public List<DetailedCandidatureDto> getDetailedCandidaturesByJobOffer(@PathVariable String offreId) {
        return candidatureService.getDetailedCandidaturesByOffreId(offreId);
    }    /**
     * Get all candidatures for job offers created by the current authenticated HR user with detailed candidate information
     * @param principal The authenticated user
     * @return List of detailed candidatures for job offers created by this HR
     */
    @GetMapping("/my-job-offers")
    public List<DetailedCandidatureDto> getCandidaturesForMyJobOffers(Principal principal) {
        String currentUserId = authUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("User not authenticated");
        }
        return candidatureService.getDetailedCandidaturesByRHId(currentUserId);
    }/**
     * Get all candidatures for job offers created by a specific HR user with detailed candidate information
     * @param hrId The ID of the HR user
     * @return List of detailed candidatures for job offers created by the specified HR
     */
    @GetMapping("/hr/{hrId}")
    public List<DetailedCandidatureDto> getCandidaturesByHR(@PathVariable String hrId) {
        return candidatureService.getDetailedCandidaturesByRHId(hrId);
    }
}
                                                                                                   