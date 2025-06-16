package com.example.RhNova.services.Auth;

import com.example.RhNova.dto.AuthResponseDto;
import com.example.RhNova.dto.CreateInternalUserRequestDto;
import com.example.RhNova.dto.LoginRequestDto;
import com.example.RhNova.dto.RegisterRequestDto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponseDto registerCandidat(RegisterRequestDto request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        // Créer un nouveau candidat
        User candidat = new User();
        candidat.setName(request.getName());
        candidat.setEmail(request.getEmail());
        candidat.setPassword(passwordEncoder.encode(request.getPassword()));
        candidat.setRole(Role.CANDIDAT);

        User savedUser = userRepository.save(candidat);

        // Générer JWT token
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return new AuthResponseDto(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Inscription réussie"
        );
    }    public AuthResponseDto login(LoginRequestDto request) {
        try {
            // Authentifier l'utilisateur
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Récupérer l'utilisateur depuis la base de données
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Générer JWT token
            String token = jwtUtil.generateToken(user.getEmail());

            return new AuthResponseDto(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    "Connexion réussie"
            );

        } catch (Exception e) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
    }

    public AuthResponseDto createInternalUser(CreateInternalUserRequestDto request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        // Valider que le rôle est autorisé pour cette création
        if (request.getRole() == null || 
            (request.getRole() != Role.RESPONSABLERH && 
             request.getRole() != Role.MANAGER && 
             request.getRole() != Role.MEMBRE_EQUIPE)) {
            throw new RuntimeException("Rôle non autorisé. Seuls RESPONSABLERH, MANAGER et MEMBRE_EQUIPE sont autorisés");
        }

        // Créer un nouveau utilisateur interne
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        // Générer JWT token
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return new AuthResponseDto(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Compte " + savedUser.getRole().name() + " créé avec succès"
        );
    }
}
