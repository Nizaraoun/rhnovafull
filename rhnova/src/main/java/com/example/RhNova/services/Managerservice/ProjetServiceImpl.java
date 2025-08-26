package com.example.RhNova.services.Managerservice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.example.RhNova.dto.ProjetDto;
import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.entity.Projet;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Manager.Equipe;
import com.example.RhNova.model.enums.StatutProjet;
import com.example.RhNova.model.enums.StatutTache;
import com.example.RhNova.model.mappers.ProjetMapper;
import com.example.RhNova.repositories.ProjetRepository;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.Managerepo.EquipeRepository;
import com.example.RhNova.services.MembreService.TacheService;
import com.example.RhNova.util.AuthUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProjetServiceImpl implements ProjetService {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private TacheService tacheService;

    @Autowired
    private ProjetMapper projetMapper;

    @Autowired
    private AuthUtil authUtil;

    @Override
    public ProjetDto createProjet(ProjetDto projetDto) {
        String currentUserEmail = authUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!authUtil.hasRole("MANAGER")) {
            throw new RuntimeException("Only managers can create projects");
        }

        Projet projet = projetMapper.toEntity(projetDto);
        projet.setManager(currentUser);
        projet.setDateCreation(LocalDateTime.now());
        projet.setLastUpdated(LocalDateTime.now());
        projet.setStatut(StatutProjet.PLANIFIE);
        projet.setProgression(0);

        Projet savedProjet = projetRepository.save(projet);
        return projetMapper.toDto(savedProjet);
    }

    @Override
    public ProjetDto updateProjet(String projetId, ProjetDto projetDto) {
        if (!canUserManageProjet(projetId, authUtil.getCurrentUserEmail())) {
            throw new RuntimeException("Access denied");
        }

        Projet existingProjet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Update fields
        existingProjet.setNom(projetDto.getNom());
        existingProjet.setDescription(projetDto.getDescription());
        existingProjet.setBudget(projetDto.getBudget());
        existingProjet.setDateDebut(projetDto.getDateDebut());
        existingProjet.setDateFin(projetDto.getDateFin());
        existingProjet.setLastUpdated(LocalDateTime.now());

        Projet updatedProjet = projetRepository.save(existingProjet);
        return projetMapper.toDto(updatedProjet);
    }

    @Override
    public void deleteProjet(String projetId) {
        if (!canUserManageProjet(projetId, authUtil.getCurrentUserEmail())) {
            throw new RuntimeException("Access denied");
        }

        // Check if project has tasks
        List<Tachedto> projectTasks = tacheService.getTachesByProjet(projetId);
        if (!projectTasks.isEmpty()) {
            throw new RuntimeException("Cannot delete project with existing tasks");
        }

        projetRepository.deleteById(projetId);
    }

    @Override
    public ProjetDto getProjetById(String projetId) {
        if (!canUserAccessProjet(projetId, authUtil.getCurrentUserEmail())) {
            throw new RuntimeException("Access denied");
        }

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjetDto projetDto = projetMapper.toDto(projet);
        
        // Add tasks to the project
        List<Tachedto> tasks = tacheService.getTachesByProjet(projetId);
        projetDto.setTaches(tasks);
        projetDto.setNombreTaches(tasks.size());
        projetDto.setTachesCompletes((int) tasks.stream()
                .filter(task -> task.getStatut() == StatutTache.TERMINEE)
                .count());

        return projetDto;
    }

    @Override
    public List<ProjetDto> getMyProjets() {
        String currentUserEmail = authUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Projet> projets = projetRepository.findByManagerOrderByDateCreationDesc(currentUser);
        return projets.stream()
                .map(projetMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjetDto> getProjetsByStatus(StatutProjet statut) {
        String currentUserEmail = authUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Projet> projets = projetRepository.findByManagerAndStatut(currentUser, statut);
        return projets.stream()
                .map(projetMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjetDto> getMyTeamProjets() {
        String currentUserEmail = authUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("Fetching projects for user: " + currentUserEmail);
        
        // Get user's team directly from the user's equipe field
        Equipe equipe = currentUser.getEquipe();
        if (equipe == null) {
            System.out.println("User is not part of any team");
            throw new RuntimeException("User is not part of any team");
        }

        List<Projet> projets = projetRepository.findByEquipeOrderByDateCreationDesc(equipe);
        return projets.stream()
                .map(projetMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjetDto updateProjetStatus(String projetId, StatutProjet statut) {
        if (!canUserManageProjet(projetId, authUtil.getCurrentUserEmail())) {
            throw new RuntimeException("Access denied");
        }

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        projet.setStatut(statut);
        projet.setLastUpdated(LocalDateTime.now());

        Projet updatedProjet = projetRepository.save(projet);
        return projetMapper.toDto(updatedProjet);
    }

    @Override
    public ProjetDto assignProjetToTeam(String projetId, String equipeId) {
      System.out.println("Assigning project " + projetId + " to team " + equipeId);

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        System.out.println("Found project: " + projet);
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Verify that the manager manages this team
        String currentUserEmail = authUtil.getCurrentUserEmail();
        System.out.println("Current user email: " + currentUserEmail);
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("Current user: " + currentUser);

        projet.setEquipe(equipe);
        projet.setLastUpdated(LocalDateTime.now());

        Projet updatedProjet = projetRepository.save(projet);
        return projetMapper.toDto(updatedProjet);
    }

    @Override
    public void updateProjetProgression(String projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<Tachedto> tasks = tacheService.getTachesByProjet(projetId);
        
        if (tasks.isEmpty()) {
            projet.setProgression(0);
        } else {
            double averageProgression = tasks.stream()
                    .mapToInt(task -> task.getProgression() != null ? task.getProgression() : 0)
                    .average()
                    .orElse(0.0);
            
            projet.setProgression((int) Math.round(averageProgression));
        }
        
        projet.setLastUpdated(LocalDateTime.now());
        projetRepository.save(projet);
    }

    @Override
    public boolean canUserAccessProjet(String projetId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("Checking access for user: " + userEmail + " on project: " + projetId);
        
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Manager can access their own projects
        if (projet.getManager().equals(user)) {
            return true;
        }
        
        // Team members can access their team's projects
        if (projet.getEquipe() != null && user.getEquipe() != null) {
            // Check if user's team is the same as project's team
            if (projet.getEquipe().getId().equals(user.getEquipe().getId())) {
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean canUserManageProjet(String projetId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Only the project manager can manage the project
        return projet.getManager().equals(user);
    }
}
