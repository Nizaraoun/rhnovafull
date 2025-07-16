package com.example.RhNova.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("nizaraoun1919@gmail.com");
        message.setTo(to);
        message.setSubject("Réinitialisation de votre mot de passe - RhNova");
        message.setText("Bonjour,\n\n" +
                "Votre mot de passe a été réinitialisé avec succès.\n\n" +
                "Votre nouveau mot de passe temporaire est: " + newPassword + "\n\n" +
                "Nous vous recommandons fortement de changer ce mot de passe dès votre prochaine connexion.\n\n" +
                "Cordialement,\n" +
                "L'équipe RhNova");

        mailSender.send(message);
    }

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("nizaraoun1919@gmail.com");
        message.setTo(to);
        message.setSubject("Code de vérification - RhNova");
        message.setText("Bonjour,\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                "Votre code de vérification est: " + otp + "\n\n" +
                "Ce code est valide pendant 10 minutes.\n\n" +
                "Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.\n\n" +
                "Cordialement,\n" +
                "L'équipe RhNova");

        mailSender.send(message);
    }
}
