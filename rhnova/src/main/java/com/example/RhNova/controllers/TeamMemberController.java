package com.example.RhNova.controllers;

import com.example.RhNova.dto.DetailedEquipeDto;
import com.example.RhNova.dto.userdto;
import com.example.RhNova.services.Managerservice.EquipeService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-member")
@CrossOrigin(origins = "*")
public class TeamMemberController {

    private final EquipeService equipeService;

    public TeamMemberController(EquipeService equipeService) {
        this.equipeService = equipeService;
    }

    /**
     * Get detailed information about the current user's team
     * Includes team name, description, manager, and all team members
     */
    @GetMapping("/my-team")
    public ResponseEntity<DetailedEquipeDto> getMyTeamDetails() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            DetailedEquipeDto teamDetails = equipeService.getMyTeamDetails(userEmail);
            return ResponseEntity.ok(teamDetails);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get only the list of team members for the current user's team
     */
    @GetMapping("/my-team/members")
    public ResponseEntity<List<userdto>> getMyTeamMembers() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            DetailedEquipeDto teamDetails = equipeService.getMyTeamDetails(userEmail);
            return ResponseEntity.ok(teamDetails.getMembres());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get the manager information for the current user's team
     */
    @GetMapping("/my-team/manager")
    public ResponseEntity<userdto> getMyTeamManager() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            DetailedEquipeDto teamDetails = equipeService.getMyTeamDetails(userEmail);
            
            if (teamDetails.getManager() == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(teamDetails.getManager());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
