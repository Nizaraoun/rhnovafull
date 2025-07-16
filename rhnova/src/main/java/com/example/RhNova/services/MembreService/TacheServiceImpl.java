package com.example.RhNova.services.MembreService;

import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.entity.Tache;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Priorite;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.enums.StatutTache;
import com.example.RhNova.repositories.TacheRepository;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.ProjetRepository;
import com.example.RhNova.util.AuthUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TacheServiceImpl implements TacheService {

    private final TacheRepository tacheRepository;
    private final UserRepository userRepository;
    private final ProjetRepository projetRepository;
    private final AuthUtil authUtil;

    private Tachedto toDto(Tache t) {
        Tachedto dto = new Tachedto();
        dto.setId(t.getId());
        dto.setTitre(t.getTitre());
        dto.setDescription(t.getDescription());
        dto.setPriorite(t.getPriorite());
        dto.setDateDebut(t.getDateDebut());
        dto.setDateFin(t.getDateFin());
        dto.setStatut(t.getStatut());
        dto.setMembreId(t.getMembre() != null ? t.getMembre().getId() : null);
        dto.setMembreName(t.getMembre() != null ? t.getMembre().getName() : null);
        dto.setProgression(t.getProgression());
        dto.setEvaluation(t.getEvaluation());
        dto.setCreatedById(t.getCreatedBy() != null ? t.getCreatedBy().getId() : null);
        dto.setCreatedByName(t.getCreatedBy() != null ? t.getCreatedBy().getName() : null);
        dto.setProjetId(t.getProjet() != null ? t.getProjet().getId() : null);
        dto.setProjetNom(t.getProjet() != null ? t.getProjet().getNom() : null);
        dto.setDateCreation(t.getDateCreation());
        dto.setLastUpdated(t.getLastUpdated());
        return dto;
    }

    private Tache toEntity(Tachedto dto) {
        Tache t = new Tache();
        t.setTitre(dto.getTitre());
        t.setDescription(dto.getDescription());
        t.setPriorite(dto.getPriorite());
        t.setDateDebut(dto.getDateDebut());
        t.setDateFin(dto.getDateFin());
        t.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutTache.A_FAIRE);
        if (dto.getMembreId() != null) {
            userRepository.findById(dto.getMembreId()).ifPresent(t::setMembre);
        }
        if (dto.getProjetId() != null) {
            projetRepository.findById(dto.getProjetId()).ifPresent(t::setProjet);
        }
        t.setProgression(dto.getProgression() != null ? dto.getProgression() : 0);
        t.setEvaluation(dto.getEvaluation());
        t.setDateCreation(LocalDateTime.now());
        t.setLastUpdated(LocalDateTime.now());
        t.setMembre(dto.getMembreId() != null ? userRepository.findById(dto.getMembreId()).orElse(null) : null);
        
        // Set creator if available
        User currentUser = authUtil.getCurrentUser();
        if (currentUser != null) {
            t.setCreatedBy(currentUser);
        }
        
        return t;
    }

    @Override
    public Tachedto createTache(Tachedto dto) {
        Tache t = toEntity(dto);
        return toDto(tacheRepository.save(t));
    }

    @Override
    public Tachedto updateTache(String id, Tachedto dto) {
        Tache existing = tacheRepository.findById(id).orElseThrow();
        existing.setTitre(dto.getTitre());
        existing.setDescription(dto.getDescription());
        existing.setPriorite(dto.getPriorite());
        existing.setDateDebut(dto.getDateDebut());
        existing.setDateFin(dto.getDateFin());
        existing.setStatut(dto.getStatut());
        if (dto.getMembreId() != null) {
            userRepository.findById(dto.getMembreId()).ifPresent(existing::setMembre);
        }
        existing.setProgression(dto.getProgression());
        existing.setEvaluation(dto.getEvaluation());
        return toDto(tacheRepository.save(existing));
    }

    @Override
    public void deleteTache(String id) {
        tacheRepository.deleteById(id);
    }

    @Override
    public List<Tachedto> getAllTaches() {
        return tacheRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public Tachedto getTacheById(String id) {
        return tacheRepository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    public List<Tachedto> getTachesByMembre(String membreId) {
        User membre = userRepository.findById(membreId).orElseThrow();
        return tacheRepository.findByMembre(membre).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Tachedto> getTachesByEquipe(String equipeId) {
        return tacheRepository.findByMembre_Equipe_Id(equipeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Tachedto> getTachesByProjet(String projetId) {
        // Find the project by ID (you'll need to inject ProjetRepository)
        return tacheRepository.findAll().stream()
            .filter(tache -> tache.getProjet() != null && tache.getProjet().getId().equals(projetId))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<Tachedto> filterTaches(StatutTache statut, String priorite) {
        Priorite p = Priorite.valueOf(priorite);
        return tacheRepository.findByStatutAndPriorite(statut, p)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public Tachedto updateStatut(String id, StatutTache statut) {
        Tache tache = tacheRepository.findById(id).orElseThrow();
        tache.setStatut(statut);
        return toDto(tacheRepository.save(tache));
    }

    @Override
    public Tachedto updateProgression(String id, Integer progression) {
        Tache t = tacheRepository.findById(id).orElseThrow();
        t.setProgression(progression);
        return toDto(tacheRepository.save(t));
    }

    @Override
    public Tachedto updateEvaluation(String id, Integer evaluation) {
        Tache t = tacheRepository.findById(id).orElseThrow();
        t.setEvaluation(evaluation);
        t.setLastUpdated(LocalDateTime.now());
        return toDto(tacheRepository.save(t));
    }

    // NEW ROLE-BASED METHODS FOR MANAGERS

    @Override
    public Tachedto createTaskByManager(Tachedto tacheDto) {
        User currentUser = authUtil.getCurrentUser();
        System.out.println("Current user: " + (currentUser != null ? currentUser.getEmail() : "null"));
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent créer des tâches");
        }
        
        Tache tache = toEntity(tacheDto);
        tache.setCreatedBy(currentUser);
        tache.setDateCreation(LocalDateTime.now());
        tache.setLastUpdated(LocalDateTime.now());
        
        return toDto(tacheRepository.save(tache));
    }

    @Override
    public Tachedto assignTaskToMember(String taskId, String memberId) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent assigner des tâches");
        }
        
        Tache tache = tacheRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tâche non trouvée"));
        
        User membre = userRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Membre non trouvé"));
        
        // Verify that the member is in the manager's team
        if (membre.getEquipe() == null || 
            !membre.getEquipe().getManager().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez assigner des tâches qu'aux membres de votre équipe");
        }
        
        tache.setMembre(membre);
        tache.setLastUpdated(LocalDateTime.now());
        
        return toDto(tacheRepository.save(tache));
    }

    @Override
    public List<Tachedto> getTasksByManagerTeam() {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent voir les tâches de leur équipe");
        }
        
        // Find the manager's team
        if (currentUser.getEquipe() == null) {
            // If manager has no team, only return tasks they created
            return tacheRepository.findByCreatedBy(currentUser)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        }
        
        // Get all tasks assigned to members of the manager's team
        List<Tache> teamTasks = tacheRepository.findByMembre_Equipe_Id(currentUser.getEquipe().getId());
        
        // Also get tasks created by this manager (but not yet assigned to anyone)
        List<Tache> createdUnassignedTasks = tacheRepository.findByCreatedBy(currentUser)
            .stream()
            .filter(task -> task.getMembre() == null) // Only unassigned tasks
            .collect(Collectors.toList());
        
        // Combine all tasks
        teamTasks.addAll(createdUnassignedTasks);
        
        return teamTasks.stream()
            .distinct() // Remove duplicates if any
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<Tachedto> getTeamTasksByStatus(StatutTache status) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent filtrer les tâches par statut");
        }
        
        // Find the manager's team
        if (currentUser.getEquipe() == null) {
            // If manager has no team, only return tasks they created with the specified status
            return tacheRepository.findByCreatedBy(currentUser)
                .stream()
                .filter(task -> task.getStatut() == status)
                .map(this::toDto)
                .collect(Collectors.toList());
        }
        
        // Get tasks by team and status
        List<Tache> teamTasks = tacheRepository.findByMembre_Equipe_IdAndStatut(currentUser.getEquipe().getId(), status);
        
        // Also get unassigned tasks created by this manager with the specified status
        List<Tache> createdUnassignedTasks = tacheRepository.findByCreatedBy(currentUser)
            .stream()
            .filter(task -> task.getMembre() == null && task.getStatut() == status)
            .collect(Collectors.toList());
        
        // Combine all tasks
        teamTasks.addAll(createdUnassignedTasks);
        
        return teamTasks.stream()
            .distinct()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public Tachedto evaluateTask(String taskId, Integer evaluation) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent évaluer les tâches");
        }
        
        Tache tache = tacheRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tâche non trouvée"));
        
        // Verify that the task belongs to the manager's team
        if (tache.getMembre() == null || 
            tache.getMembre().getEquipe() == null ||
            !tache.getMembre().getEquipe().getManager().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez évaluer que les tâches de votre équipe");
        }
        
        // Only allow evaluation of completed tasks
        if (tache.getStatut() != StatutTache.TERMINEE) {
            throw new RuntimeException("Seules les tâches terminées peuvent être évaluées");
        }
        
        tache.setEvaluation(evaluation);
        tache.setLastUpdated(LocalDateTime.now());
        
        return toDto(tacheRepository.save(tache));
    }

    // NEW ROLE-BASED METHODS FOR TEAM MEMBERS

    @Override
    public List<Tachedto> getMyAssignedTasks() {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        
        return tacheRepository.findByMembre(currentUser)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<Tachedto> getMyTeamTasks() {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getEquipe() == null) {
            throw new RuntimeException("Utilisateur non authentifié ou non membre d'une équipe");
        }
        
        return tacheRepository.findByMembre_Equipe_Id(currentUser.getEquipe().getId())
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public Tachedto updateMyTaskProgress(String taskId, Integer progression) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        
        Tache tache = tacheRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tâche non trouvée"));
        
        // Verify that the task is assigned to the current user
        if (tache.getMembre() == null || !tache.getMembre().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez modifier la progression que de vos propres tâches");
        }
        
        // Update progression and status based on progress
        tache.setProgression(progression);
        
        if (progression == 0) {
            tache.setStatut(StatutTache.A_FAIRE);
        } else if (progression < 100) {
            tache.setStatut(StatutTache.EN_COURS);
        } else {
            tache.setStatut(StatutTache.TERMINEE);
        }
        
        tache.setLastUpdated(LocalDateTime.now());
        
        return toDto(tacheRepository.save(tache));
    }

    @Override
    public Tachedto updateMyTaskStatus(String taskId, StatutTache status) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        
        Tache tache = tacheRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tâche non trouvée"));
        
        // Verify that the task is assigned to the current user
        if (tache.getMembre() == null || !tache.getMembre().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez modifier le statut que de vos propres tâches");
        }
        
        tache.setStatut(status);
        
        // Update progression based on status
        if (status == StatutTache.A_FAIRE && tache.getProgression() > 0) {
            tache.setProgression(0);
        } else if (status == StatutTache.EN_COURS && tache.getProgression() == 0) {
            tache.setProgression(10); // Set a minimal progress
        } else if (status == StatutTache.TERMINEE) {
            tache.setProgression(100);
        }
        
        tache.setLastUpdated(LocalDateTime.now());
        
        return toDto(tacheRepository.save(tache));
    }

    // COMMON METHODS WITH AUTHENTICATION

    @Override
    public Tachedto getTaskByIdWithAuth(String taskId) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        
        Tache tache = tacheRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tâche non trouvée"));
        
        // Managers can see all tasks of their team
        if (currentUser.getRole() == Role.MANAGER) {
            if (tache.getMembre() != null && 
                tache.getMembre().getEquipe() != null &&
                tache.getMembre().getEquipe().getManager().getId().equals(currentUser.getId())) {
                return toDto(tache);
            }
        }
        
        // Team members can see tasks assigned to them or tasks in their team
        if (currentUser.getRole() == Role.MEMBRE_EQUIPE) {
            // Own tasks
            if (tache.getMembre() != null && tache.getMembre().getId().equals(currentUser.getId())) {
                return toDto(tache);
            }
            // Team tasks (for viewing other members' progress)
            if (currentUser.getEquipe() != null && 
                tache.getMembre() != null &&
                tache.getMembre().getEquipe() != null &&
                tache.getMembre().getEquipe().getId().equals(currentUser.getEquipe().getId())) {
                return toDto(tache);
            }
        }
        
        throw new RuntimeException("Vous n'avez pas l'autorisation de voir cette tâche");
    }

}
