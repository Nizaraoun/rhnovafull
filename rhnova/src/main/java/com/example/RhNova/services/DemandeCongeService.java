package com.example.RhNova.services;

import com.example.RhNova.dto.DemandeCongedto;
import com.example.RhNova.model.entity.DemandeConge;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.repositories.DemandeCongeRepository;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.util.AuthUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeCongeService {

    private final DemandeCongeRepository congeRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;

    @Autowired
    public DemandeCongeService(DemandeCongeRepository congeRepository, UserRepository userRepository, AuthUtil authUtil) {
        this.congeRepository = congeRepository;
        this.userRepository = userRepository;
        this.authUtil = authUtil;
    }

    public DemandeConge createDemande(DemandeCongedto dto) {
        User employe = userRepository.findById(dto.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        User validateur = userRepository.findById(dto.getValidateurId())
                .orElseThrow(() -> new RuntimeException("Validateur non trouvé"));

        DemandeConge demande = new DemandeConge();
        demande.setEmploye(employe);
        demande.setValidateur(validateur);
        demande.setDateDebut(dto.getDateDebut());
        demande.setDateFin(dto.getDateFin());
        demande.setTypeConge(dto.getTypeConge());
        demande.setRaison(dto.getRaison());
        demande.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutDemandeConge.EN_ATTENTE);
        demande.setDateCreation(java.time.LocalDate.now());
        demande.setNombreJours(calculateWorkingDays(dto.getDateDebut(), dto.getDateFin()));

        return congeRepository.save(demande);
    }

    public List<DemandeConge> getAll() {
        return congeRepository.findAll();
    }

    public void deleteById(String id) {
        congeRepository.deleteById(id);
    }

    /**
     * Calculate working days between two dates (excluding weekends)
     */
    private int calculateWorkingDays(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return 0;
        }

        int workingDays = 0;

        java.time.LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek().getValue() < 6) { // Monday to Friday
                workingDays++;
            }
            current = current.plusDays(1);
        }

        return workingDays;
    }

    // Helper method to convert entity to DTO
    private DemandeCongedto toDto(DemandeConge demande) {
        DemandeCongedto dto = new DemandeCongedto();
        dto.setId(demande.getId());
        dto.setEmployeId(demande.getEmploye() != null ? demande.getEmploye().getId() : null);
        dto.setEmployeNom(demande.getEmploye() != null ? demande.getEmploye().getName() : null);
        dto.setValidateurId(demande.getValidateur() != null ? demande.getValidateur().getId() : null);
        dto.setValidateurNom(demande.getValidateur() != null ? demande.getValidateur().getName() : null);
        dto.setDateDebut(demande.getDateDebut());
        dto.setDateFin(demande.getDateFin());
        dto.setTypeConge(demande.getTypeConge());
        dto.setStatut(demande.getStatut());
        dto.setRaison(demande.getRaison());
        dto.setNombreJours(demande.getNombreJours());
        dto.setDateCreation(demande.getDateCreation());
        dto.setDateValidation(demande.getDateValidation());
        dto.setCommentaireValidateur(demande.getCommentaireValidateur());
        return dto;
    }

    // ROLE-BASED METHODS FOR MANAGERS

    /**
     * Manager creates a leave request for themselves
     */
    public DemandeCongedto createManagerLeaveRequest(DemandeCongedto dto) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent créer leur propre demande de congé");
        }

        // For managers, they need HR approval - for now, set validator to null and let HR handle it
        // In a real scenario, you'd find an available HR person
        User hrValidator = null; // Will be set by HR when processing

        DemandeConge demande = new DemandeConge();
        demande.setEmploye(currentUser);
        demande.setValidateur(hrValidator);
        demande.setDateDebut(dto.getDateDebut());
        demande.setDateFin(dto.getDateFin());
        demande.setTypeConge(dto.getTypeConge());
        demande.setRaison(dto.getRaison());
        demande.setStatut(StatutDemandeConge.EN_ATTENTE);
        demande.setDateCreation(LocalDate.now());
        demande.setNombreJours(calculateWorkingDays(dto.getDateDebut(), dto.getDateFin()));

        return toDto(congeRepository.save(demande));
    }

    /**
     * Manager views leave requests from their team members
     */
    public List<DemandeCongedto> getTeamLeaveRequests() {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            System.out.println("Seuls les managers peuvent voir les demandes de leur équipe");
            throw new RuntimeException("Seuls les managers peuvent voir les demandes de leur équipe");
        }

     
        return congeRepository.findByValidateur(currentUser)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Manager approves team member leave request
     */
    public DemandeCongedto approveLeaveRequestByManager(String leaveId, String comments) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent approuver les demandes");
        }

        DemandeConge demande = congeRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));

        // Verify that this manager is the validator
        if (!demande.getValidateur().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez approuver que les demandes qui vous sont assignées");
        }

        if (demande.getStatut() != StatutDemandeConge.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        demande.setStatut(StatutDemandeConge.ACCEPTEE);
        demande.setDateValidation(LocalDate.now());
        demande.setCommentaireValidateur(comments);

        return toDto(congeRepository.save(demande));
    }

    /**
     * Manager rejects team member leave request
     */
    public DemandeCongedto rejectLeaveRequestByManager(String leaveId, String comments) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getRole() != Role.MANAGER) {
            throw new RuntimeException("Seuls les managers peuvent rejeter les demandes");
        }

        DemandeConge demande = congeRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));

        // Verify that this manager is the validator
        if (!demande.getValidateur().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez rejeter que les demandes qui vous sont assignées");
        }

        if (demande.getStatut() != StatutDemandeConge.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        demande.setStatut(StatutDemandeConge.REFUSEE);
        demande.setDateValidation(LocalDate.now());
        demande.setCommentaireValidateur(comments);

        return toDto(congeRepository.save(demande));
    }

    // ROLE-BASED METHODS FOR TEAM MEMBERS

    /**
     * Team member creates a leave request
     */
    public DemandeCongedto createMemberLeaveRequest(DemandeCongedto dto) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        // Find the appropriate validator based on user role
        User validator;
        if (currentUser.getRole() == Role.MEMBRE_EQUIPE) {
            // Team members need manager approval
            if (currentUser.getEquipe() == null || currentUser.getEquipe().getManager() == null) {
                throw new RuntimeException("Aucun manager trouvé pour valider votre demande");
            }
            validator = currentUser.getEquipe().getManager();
        } else {
            throw new RuntimeException("Type d'utilisateur non supporté pour cette méthode");
        }

        DemandeConge demande = new DemandeConge();
        demande.setEmploye(currentUser);
        demande.setValidateur(validator);
        demande.setDateDebut(dto.getDateDebut());
        demande.setDateFin(dto.getDateFin());
        demande.setTypeConge(dto.getTypeConge());
        demande.setRaison(dto.getRaison());
        demande.setStatut(StatutDemandeConge.EN_ATTENTE);
        demande.setDateCreation(LocalDate.now());
        demande.setNombreJours(calculateWorkingDays(dto.getDateDebut(), dto.getDateFin()));

        return toDto(congeRepository.save(demande));
    }

    /**
     * Get user's own leave requests
     */
    public List<DemandeCongedto> getMyLeaveRequests() {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
        System.out.println("Utilisateur non authentifié");
            throw new RuntimeException("Utilisateur non authentifié");
        }

        return congeRepository.findByEmploye(currentUser)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Team member views their team's leave calendar
     */
    public List<DemandeCongedto> getTeamLeaveCalendar() {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null || currentUser.getEquipe() == null) {
            throw new RuntimeException("Utilisateur non authentifié ou non membre d'une équipe");
        }

        // Get approved leaves for team members (excluding pending/rejected)
        return congeRepository.findByEmploye_Equipe_IdAndStatut(
            currentUser.getEquipe().getId(), 
            StatutDemandeConge.ACCEPTEE)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Update user's own leave request (only if pending)
     */
    public DemandeCongedto updateMyLeaveRequest(String leaveId, DemandeCongedto dto) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        DemandeConge demande = congeRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));

        // Verify ownership
        if (!demande.getEmploye().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres demandes");
        }

        // Only allow modification if still pending
        if (demande.getStatut() != StatutDemandeConge.EN_ATTENTE) {
            throw new RuntimeException("Vous ne pouvez modifier que les demandes en attente");
        }

        // Update fields
        demande.setDateDebut(dto.getDateDebut());
        demande.setDateFin(dto.getDateFin());
        demande.setTypeConge(dto.getTypeConge());
        demande.setRaison(dto.getRaison());
        demande.setNombreJours(calculateWorkingDays(dto.getDateDebut(), dto.getDateFin()));

        return toDto(congeRepository.save(demande));
    }

    /**
     * Cancel user's own leave request (only if pending)
     */
    public void cancelMyLeaveRequest(String leaveId) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        DemandeConge demande = congeRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));

        // Verify ownership
        if (!demande.getEmploye().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous ne pouvez annuler que vos propres demandes");
        }

        // Only allow cancellation if still pending
        if (demande.getStatut() != StatutDemandeConge.EN_ATTENTE) {
            throw new RuntimeException("Vous ne pouvez annuler que les demandes en attente");
        }

        congeRepository.deleteById(leaveId);
    }

    // COMMON METHODS

    /**
     * Get leave request by ID with authorization check
     */
    public DemandeCongedto getLeaveByIdWithAuth(String leaveId) {
        User currentUser = authUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        DemandeConge demande = congeRepository.findById(leaveId)
            .orElseThrow(() -> new RuntimeException("Demande de congé non trouvée"));

        // Check authorization
        boolean authorized = false;
        
        // User can see their own requests
        if (demande.getEmploye().getId().equals(currentUser.getId())) {
            authorized = true;
        }
        
        // Validator can see requests they need to approve
        if (demande.getValidateur() != null && demande.getValidateur().getId().equals(currentUser.getId())) {
            authorized = true;
        }
        
        // HR can see all requests
        if (currentUser.getRole() == Role.RESPONSABLERH) {
            authorized = true;
        }

        if (!authorized) {
            throw new RuntimeException("Vous n'avez pas l'autorisation de voir cette demande");
        }

        return toDto(demande);
    }

    // EXISTING METHODS
}