package com.example.RhNova.services.Managerservice;

import com.example.RhNova.dto.Equipedto;
import com.example.RhNova.dto.userdto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Manager.Equipe;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.mappers.EquipeMapper;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.Managerepo.EquipeRepository;

import org.springframework.stereotype.Service;

import java.util.List;
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

}
