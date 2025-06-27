package com.example.RhNova.services.Managerservice;

import com.example.RhNova.dto.Equipedto;
import com.example.RhNova.dto.DetailedEquipeDto;
import com.example.RhNova.dto.userdto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Manager.Equipe;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.mappers.EquipeMapper;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.Managerepo.EquipeRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EquipeServiceImpl implements EquipeService {

    private final EquipeRepository equipeRepository;
    private final UserRepository userRepository; // ajouté pour accéder aux users

    public EquipeServiceImpl(EquipeRepository equipeRepository, UserRepository userRepository) {
        this.equipeRepository = equipeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Equipedto createEquipe(Equipedto dto) {
        User manager = userRepository.findById(dto.getManagerId()).orElse(null);
        List<User> membres = userRepository.findAllById(dto.getMembreIds());

        Equipe equipe = EquipeMapper.fromDTO(dto, manager, membres);
        Equipe saved = equipeRepository.save(equipe);
        return EquipeMapper.toDTO(saved);
    }

    @Override
    public List<Equipedto> getAllEquipes() {
        return equipeRepository.findAll()
                .stream()
                .map(EquipeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Equipedto getEquipeById(String id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée"));
        return EquipeMapper.toDTO(equipe);
    }

    @Override
    public Equipedto updateEquipe(String id, Equipedto dto) {
        Equipe existing = equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée"));

        User manager = userRepository.findById(dto.getManagerId()).orElse(null);
        List<User> membres = userRepository.findAllById(dto.getMembreIds());

        existing.setNom(dto.getNom());
        existing.setDescription(dto.getDescription());
        existing.setManager(manager);
        existing.setMembres(membres);

        Equipe updated = equipeRepository.save(existing);
        return EquipeMapper.toDTO(updated);
    }

    @Override
    public void deleteEquipe(String id) {
        equipeRepository.deleteById(id);
    }

    @Override
    public void addMembreToEquipe(String equipeId, String userId) {
    Equipe equipe = equipeRepository.findById(equipeId)
            .orElseThrow(() -> new RuntimeException("Équipe non trouvée"));

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

    // Vérifie si l'utilisateur a le rôle MEMBRE_EQUIPE
    if (user.getRole() != Role.MEMBRE_EQUIPE) {
        throw new RuntimeException("Seuls les utilisateurs avec le rôle MEMBRE_EQUIPE peuvent rejoindre une équipe");
    }

    // Associer l'utilisateur à l'équipe
    user.setEquipe(equipe);
    userRepository.save(user);   
    }

    @Override
    public void removeMembreFromEquipe(String equipeId, String userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

    if (user.getEquipe() == null || !user.getEquipe().getId().equals(equipeId)) {
        throw new RuntimeException("Ce membre n'appartient pas à cette équipe");
    }

    // Retirer l'association
    user.setEquipe(null);
    userRepository.save(user);
    }

    @Override
    public List<userdto> getMembresByEquipeId(String equipeId) {
        List<User> membres = userRepository.findByEquipeId(equipeId);
        return membres.stream().map(userdto ::new).collect(Collectors.toList());
    }

    @Override
    public DetailedEquipeDto getMyTeamDetails(String userEmail) {
        // Find the user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + userEmail));
        System.out.println("Utilisateur trouvé: " + user.getEmail());
        
        // Check if user has a team (either as manager or member)
        Equipe equipe = null;
        
        // First check if user is a manager of a team
        if (user.getRole() == Role.MANAGER) {
            Optional<Equipe> managerTeam = equipeRepository.findByManagerId(user.getId());
            if (managerTeam.isPresent()) {
                equipe = managerTeam.get();
            }
        }
        
        // If not found as manager, check if user belongs to a team as a member
        if (equipe == null && user.getEquipe() != null) {
            equipe = user.getEquipe();
        }
        
        // If still no team found, throw exception
        if (equipe == null) {
            System.out.println("L'utilisateur n'appartient à aucune équipe: " + user.getEmail());
            throw new RuntimeException("Vous n'êtes membre d'aucune équipe. Contactez votre manager pour être ajouté à une équipe.");
        }

        // Get all team members
        List<User> membres = userRepository.findByEquipeId(equipe.getId());
        List<userdto> membresDto = membres.stream()
                .map(userdto::new)
                .collect(Collectors.toList());
        
        // Create manager DTO
        userdto managerDto = equipe.getManager() != null ? new userdto(equipe.getManager()) : null;
        
        // Build detailed team information
        return DetailedEquipeDto.builder()
                .id(equipe.getId())
                .nom(equipe.getNom())
                .description(equipe.getDescription() != null ? equipe.getDescription() : "Aucune description disponible")
                .manager(managerDto)
                .membres(membresDto)
                .nombreMembres(membres.size())
                .build();
    }

    @Override
    public DetailedEquipeDto getManagerTeamDetails(String managerEmail) {
        // Find the manager by email
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé avec l'email: " + managerEmail));
        
        // Check if user is actually a manager
        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("L'utilisateur n'a pas le rôle de manager");
        }
        
        // Find the team managed by this manager
        Equipe equipe = equipeRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new RuntimeException("Aucune équipe trouvée pour ce manager"));
        
        // Get all team members
        List<User> membres = userRepository.findByEquipeId(equipe.getId());
        List<userdto> membresDto = membres.stream()
                .map(userdto::new)
                .collect(Collectors.toList());
        
        // Create manager DTO
        userdto managerDto = new userdto(manager);
        
        // Build detailed team information
        return DetailedEquipeDto.builder()
                .id(equipe.getId())
                .nom(equipe.getNom())
                .description(equipe.getDescription() != null ? equipe.getDescription() : "Aucune description disponible")
                .manager(managerDto)
                .membres(membresDto)
                .nombreMembres(membres.size())
                .build();
    }

    @Override
    public List<DetailedEquipeDto> getManagerTeamsDetails(String managerEmail) {
        // Find the manager by email
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé avec l'email: " + managerEmail));
        
        // Check if user is actually a manager
        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("L'utilisateur n'a pas le rôle de manager");
        }
        
        // Find all teams managed by this manager
        List<Equipe> equipes = equipeRepository.findAllByManagerId(manager.getId());
        
        if (equipes.isEmpty()) {
            throw new RuntimeException("Aucune équipe trouvée pour ce manager");
        }
        
        // Create manager DTO once
        userdto managerDto = new userdto(manager);
        
        // Build detailed team information for each team
        return equipes.stream().map(equipe -> {
            // Get all team members for this specific team
            List<User> membres = userRepository.findByEquipeId(equipe.getId());
            List<userdto> membresDto = membres.stream()
                    .map(userdto::new)
                    .collect(Collectors.toList());
            
            return DetailedEquipeDto.builder()
                    .id(equipe.getId())
                    .nom(equipe.getNom())
                    .description(equipe.getDescription() != null ? equipe.getDescription() : "Aucune description disponible")
                    .manager(managerDto)
                    .membres(membresDto)
                    .nombreMembres(membres.size())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public DetailedEquipeDto getTeamDetailsByManagerId(String managerId) {
        // Find the manager by ID
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager non trouvé avec l'ID: " + managerId));
        
        // Check if user is actually a manager
        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("L'utilisateur n'a pas le rôle de manager");
        }
        
        // Find the team managed by this manager
        Equipe equipe = equipeRepository.findByManagerId(managerId)
                .orElseThrow(() -> new RuntimeException("Aucune équipe trouvée pour ce manager"));
        
        // Get all team members
        List<User> membres = userRepository.findByEquipeId(equipe.getId());
        List<userdto> membresDto = membres.stream()
                .map(userdto::new)
                .collect(Collectors.toList());
        
        // Create manager DTO
        userdto managerDto = new userdto(manager);
        
        // Build detailed team information
        return DetailedEquipeDto.builder()
                .id(equipe.getId())
                .nom(equipe.getNom())
                .description(equipe.getDescription() != null ? equipe.getDescription() : "Aucune description disponible")
                .manager(managerDto)
                .membres(membresDto)
                .nombreMembres(membres.size())
                .build();
    }

}
