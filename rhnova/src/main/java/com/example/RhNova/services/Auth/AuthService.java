package com.example.RhNova.services.Auth;

import com.example.RhNova.dto.AuthResponseDto;
import com.example.RhNova.dto.CreateInternalUserRequestDto;
import com.example.RhNova.dto.ForgotPasswordRequestDto;
import com.example.RhNova.dto.ForgotPasswordResponseDto;
import com.example.RhNova.dto.LoginRequestDto;
import com.example.RhNova.dto.OtpResponseDto;
import com.example.RhNova.dto.RegisterRequestDto;
import com.example.RhNova.dto.VerifyOtpRequestDto;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.services.EmailService;
import com.example.RhNova.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

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

    @Autowired
    private EmailService emailService;

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

    public ForgotPasswordResponseDto forgotPassword(ForgotPasswordRequestDto request) {
        // Rechercher l'utilisateur par email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Aucun utilisateur trouvé avec cet email"));

        // Générer un OTP
        String otp = generateOtp();

        // Sauvegarder l'OTP et son temps d'expiration (10 minutes)
        user.setResetOtp(otp);
        user.setOtpExpirationTime(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Envoyer l'OTP par email
        try {
            emailService.sendOtpEmail(user.getEmail(), otp);
            return new ForgotPasswordResponseDto(
                "Un code de vérification a été envoyé à votre adresse email. Il est valide pendant 10 minutes."
            );
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }
    }

    public OtpResponseDto verifyOtpAndResetPassword(VerifyOtpRequestDto request) {
        // Rechercher l'utilisateur par email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Aucun utilisateur trouvé avec cet email"));

        // Vérifier si l'OTP existe
        if (user.getResetOtp() == null) {
            throw new RuntimeException("Aucun code de vérification n'a été demandé pour cet email");
        }

        // Vérifier si l'OTP n'a pas expiré
        if (user.getOtpExpirationTime() == null || user.getOtpExpirationTime().isBefore(LocalDateTime.now())) {
            // Nettoyer l'OTP expiré
            user.setResetOtp(null);
            user.setOtpExpirationTime(null);
            userRepository.save(user);
            throw new RuntimeException("Le code de vérification a expiré. Veuillez en demander un nouveau");
        }

        // Vérifier si l'OTP correspond
        if (!user.getResetOtp().equals(request.getOtp())) {
            throw new RuntimeException("Code de vérification incorrect");
        }

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        
        // Nettoyer l'OTP après utilisation
        user.setResetOtp(null);
        user.setOtpExpirationTime(null);
        
        userRepository.save(user);

        return new OtpResponseDto("Votre mot de passe a été mis à jour avec succès");
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // Génère un nombre à 6 chiffres
        return String.valueOf(otp);
    }
}
