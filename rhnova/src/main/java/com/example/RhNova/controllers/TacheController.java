package com.example.RhNova.controllers;

import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.enums.StatutTache;
import com.example.RhNova.services.MembreService.*;
import com.example.RhNova.util.AuthUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Pour permettre les requêtes depuis Angular
public class TacheController {

    private final TacheService tacheService;
    private final AuthUtil authUtil;

    // MANAGER ENDPOINTS
    
    /**
     * Manager creates a new task
     */
    @PostMapping("/manager/create")
    public ResponseEntity<Tachedto> createTask(@RequestBody Tachedto dto) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            Tachedto createdTask = tacheService.createTaskByManager(dto);
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager assigns task to team member
     */
    @PostMapping("/manager/assign/{taskId}/{memberId}")
    public ResponseEntity<Tachedto> assignTask(@PathVariable String taskId, @PathVariable String memberId) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            Tachedto assignedTask = tacheService.assignTaskToMember(taskId, memberId);
            return ResponseEntity.ok(assignedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager views all tasks of their team
     */
    @GetMapping("/manager/my-team-tasks")
    public ResponseEntity<List<Tachedto>> getMyTeamTasks() {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<Tachedto> tasks = tacheService.getTasksByManagerTeam();
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager views tasks by status and progression
     */
    @GetMapping("/manager/team-tasks/status/{status}")
    public ResponseEntity<List<Tachedto>> getTeamTasksByStatus(@PathVariable StatutTache status) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<Tachedto> tasks = tacheService.getTeamTasksByStatus(status);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manager evaluates a completed task
     */
    @PatchMapping("/manager/{taskId}/evaluate")
    public ResponseEntity<Tachedto> evaluateTask(@PathVariable String taskId, @RequestParam Integer evaluation) {
        try {
            if (!authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            Tachedto task = tacheService.evaluateTask(taskId, evaluation);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // TEAM MEMBER ENDPOINTS

    /**
     * Team member views their own tasks
     */
    @GetMapping("/member/my-tasks")
    public ResponseEntity<List<Tachedto>> getMyTasks() {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<Tachedto> tasks = tacheService.getMyAssignedTasks();
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Team member views all tasks of their team (to see others' progress)
     */
    @GetMapping("/member/team-tasks")
    public ResponseEntity<List<Tachedto>> getTeamTasks() {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            List<Tachedto> tasks = tacheService.getMyTeamTasks();
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Team member updates progress of their own task
     */
    @PatchMapping("/member/{taskId}/progress")
    public ResponseEntity<Tachedto> updateMyTaskProgress(@PathVariable String taskId, @RequestParam Integer progression) {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            Tachedto task = tacheService.updateMyTaskProgress(taskId, progression);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Team member updates status of their own task
     */
    @PatchMapping("/member/{taskId}/status")
    public ResponseEntity<Tachedto> updateMyTaskStatus(@PathVariable String taskId, @RequestParam StatutTache status) {
        try {
            if (!authUtil.hasRole("MEMBRE_EQUIPE") && !authUtil.hasRole("MANAGER")) {
                return ResponseEntity.status(403).build();
            }
            Tachedto task = tacheService.updateMyTaskStatus(taskId, status);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // COMMON ENDPOINTS

    /**
     * Get task details by ID (for authorized users only)
     */
    @GetMapping("/details/{taskId}")
    public ResponseEntity<Tachedto> getTaskById(@PathVariable String taskId) {
        try {
            Tachedto task = tacheService.getTaskByIdWithAuth(taskId);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // LEGACY ENDPOINTS (keep for backward compatibility but add auth checks)
    
    @PostMapping("/legacy")
    public Tachedto create(@RequestBody Tachedto dto) {
        return tacheService.createTache(dto);
    }

    @PutMapping("/{id}")
    public Tachedto update(@PathVariable String id, @RequestBody Tachedto dto) {
        return tacheService.updateTache(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        tacheService.deleteTache(id);
    }

    @GetMapping
    public List<Tachedto> getAll() {
        return tacheService.getAllTaches();
    }

    @GetMapping("/{id}")
    public Tachedto getOne(@PathVariable String id) {
        return tacheService.getTacheById(id);
    }

    @GetMapping("/membre/{membreId}")
    public List<Tachedto> getByMembre(@PathVariable String membreId) {
        return tacheService.getTachesByMembre(membreId);
    }

    @GetMapping("/equipe/{equipeId}")
    public List<Tachedto> getByEquipe(@PathVariable String equipeId) {
        return tacheService.getTachesByEquipe(equipeId);
    }

    @GetMapping("/filter")
    public List<Tachedto> filterTaches(@RequestParam StatutTache statut, @RequestParam String priorite) {
        return tacheService.filterTaches(statut, priorite);
    }

    @PatchMapping("/{id}/statut")
    public Tachedto updateStatut(@PathVariable String id, @RequestParam StatutTache statut) {
        return tacheService.updateStatut(id, statut);
    }

    @PatchMapping("/{id}/progression")
    public Tachedto updateProgression(@PathVariable String id, @RequestParam Integer progression) {
        return tacheService.updateProgression(id, progression);
    }

    @PatchMapping("/{id}/evaluation")
    public Tachedto updateEvaluation(@PathVariable String id, @RequestParam Integer evaluation) {
        return tacheService.updateEvaluation(id, evaluation);
    }

}
