package com.example.RhNova.controllers;

import com.example.RhNova.dto.ProjetDto;
import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.enums.StatutProjet;
import com.example.RhNova.services.Managerservice.ProjetService;
import com.example.RhNova.services.MembreService.TacheService;
import com.example.RhNova.util.AuthUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjetController {

    private final ProjetService projetService;
    private final TacheService tacheService;
    private final AuthUtil authUtil;

    // MANAGER ENDPOINTS
    
    /**
     * Manager creates a new project
     */
    @PostMapping("/manager/create")
    public ResponseEntity<ProjetDto> createProjet(@RequestBody ProjetDto projetDto) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            ProjetDto createdProjet = projetService.createProjet(projetDto);
            return ResponseEntity.ok(createdProjet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager updates a project
     */
    @PutMapping("/manager/{projetId}")
    public ResponseEntity<ProjetDto> updateProjet(@PathVariable String projetId, @RequestBody ProjetDto projetDto) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            ProjetDto updatedProjet = projetService.updateProjet(projetId, projetDto);
            return ResponseEntity.ok(updatedProjet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager deletes a project
     */
    @DeleteMapping("/manager/{projetId}")
    public ResponseEntity<Void> deleteProjet(@PathVariable String projetId) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            projetService.deleteProjet(projetId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager gets all their projects
     */
    @GetMapping("/manager/my-projects")
    public ResponseEntity<List<ProjetDto>> getMyProjets() {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<ProjetDto> projets = projetService.getMyProjets();
            return ResponseEntity.ok(projets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager gets projects by status
     */
    @GetMapping("/manager/my-projects/status/{status}")
    public ResponseEntity<List<ProjetDto>> getProjetsByStatus(@PathVariable StatutProjet status) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<ProjetDto> projets = projetService.getProjetsByStatus(status);
            return ResponseEntity.ok(projets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager assigns project to team
     */
    @PatchMapping("/manager/{projetId}/assign-team/{equipeId}")
    public ResponseEntity<ProjetDto> assignProjetToTeam(@PathVariable String projetId, @PathVariable String equipeId) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            ProjetDto projet = projetService.assignProjetToTeam(projetId, equipeId);
            return ResponseEntity.ok(projet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager updates project status
     */
    @PatchMapping("/manager/{projetId}/status")
    public ResponseEntity<ProjetDto> updateProjetStatus(@PathVariable String projetId, @RequestParam StatutProjet status) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            ProjetDto projet = projetService.updateProjetStatus(projetId, status);
            return ResponseEntity.ok(projet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager creates a task within a project
     */
    @PostMapping("/manager/{projetId}/tasks/create")
    public ResponseEntity<Tachedto> createTaskInProject(@PathVariable String projetId, @RequestBody Tachedto tachedto) {
        try {
            // if (!authUtil.hasRole("MANAGER")) {
            //     return ResponseEntity.status(403).build();
            // }
            
            // Set the project ID in the task
            tachedto.setProjetId(projetId);
            
            Tachedto createdTask = tacheService.createTaskByManager(tachedto);
            
            // Update project progression after creating task
            projetService.updateProjetProgression(projetId);
            
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // TEAM MEMBER ENDPOINTS
    
    /**
     * Team member gets projects assigned to their team
     */
    @GetMapping("/member/my-team-projects")
    public ResponseEntity<List<ProjetDto>> getMyTeamProjets() {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                System.out.println("Unauthorized access attempt by user: " + authUtil.getCurrentUserEmail());
                return ResponseEntity.status(403).build();
            }
            List<ProjetDto> projets = projetService.getMyTeamProjets();
            return ResponseEntity.ok(projets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // COMMON ENDPOINTS
    
    /**
     * Get project details by ID (for authorized users)
     */
    @GetMapping("/{projetId}")
    public ResponseEntity<ProjetDto> getProjetById(@PathVariable String projetId) {
        try {
            ProjetDto projet = projetService.getProjetById(projetId);
            return ResponseEntity.ok(projet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all tasks for a specific project
     */
    @GetMapping("/{projetId}/tasks")
    public ResponseEntity<List<Tachedto>> getProjectTasks(@PathVariable String projetId) {
        System.out.println("Fetching tasks for project ID: " + projetId);
        try {
            // Check if user can access this project
            // if (!projetService.canUserAccessProjet(projetId, authUtil.getCurrentUserEmail())) {
            //     System.out.println("User does not have access to project ID: " + projetId);
            //     return ResponseEntity.status(403).build();
            // }
            System.out.println("User has access to project ID: " + projetId);
            List<Tachedto> tasks = tacheService.getTachesByProjet(projetId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            System.out.println("Error fetching tasks for project ID: " + projetId + " - " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update project progression (triggered automatically when tasks are updated)
     */
    @PatchMapping("/{projetId}/update-progression")
    public ResponseEntity<Void> updateProjetProgression(@PathVariable String projetId) {
        try {
            // if (!projetService.canUserAccessProjet(projetId, authUtil.getCurrentUserEmail())) {
            //     return ResponseEntity.status(403).build();
            // }
            
            projetService.updateProjetProgression(projetId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
