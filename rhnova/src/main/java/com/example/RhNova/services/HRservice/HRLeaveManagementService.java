package com.example.RhNova.services.HRservice;

import com.example.RhNova.dto.DemandeCongedto;
import com.example.RhNova.model.entity.DemandeConge;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.model.enums.TypeConge;
import com.example.RhNova.repositories.DemandeCongeRepository;
import com.example.RhNova.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HRLeaveManagementService {

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get all leave requests with employee and validator information
     */
    public List<DemandeCongedto> getAllLeaveRequests() {
        List<DemandeConge> leaves = demandeCongeRepository.findAll();
        return leaves.stream()
                .map(this::convertToDto)
                .sorted((a, b) -> b.getDateCreation().compareTo(a.getDateCreation()))
                .collect(Collectors.toList());
    }

    /**
     * Get leave requests by status
     */
    public List<DemandeCongedto> getLeaveRequestsByStatus(StatutDemandeConge status) {
        List<DemandeConge> leaves = demandeCongeRepository.findByStatut(status);
        return leaves.stream()
                .map(this::convertToDto)
                .sorted((a, b) -> b.getDateCreation().compareTo(a.getDateCreation()))
                .collect(Collectors.toList());
    }

    /**
     * Get leave requests by type
     */
    public List<DemandeCongedto> getLeaveRequestsByType(TypeConge type) {
        List<DemandeConge> leaves = demandeCongeRepository.findByTypeConge(type);
        return leaves.stream()
                .map(this::convertToDto)
                .sorted((a, b) -> b.getDateCreation().compareTo(a.getDateCreation()))
                .collect(Collectors.toList());
    }

    /**
     * Get leave requests by date range
     */
    public List<DemandeCongedto> getLeaveRequestsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<DemandeConge> leaves = demandeCongeRepository.findByDateDebutBetween(startDate, endDate);
        return leaves.stream()
                .map(this::convertToDto)
                .sorted((a, b) -> b.getDateCreation().compareTo(a.getDateCreation()))
                .collect(Collectors.toList());
    }

    /**
     * Approve leave request
     */
    public DemandeCongedto approveLeaveRequest(String leaveId, String hrId, String comments) {
        DemandeConge leave = demandeCongeRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        leave.setStatut(StatutDemandeConge.ACCEPTEE);
        leave.setValidateur(hr);
        leave.setDateValidation(LocalDate.now());
        if (comments != null && !comments.trim().isEmpty()) {
            leave.setCommentaireValidateur(comments);
        }

        DemandeConge savedLeave = demandeCongeRepository.save(leave);
        return convertToDto(savedLeave);
    }

    /**
     * Reject leave request
     */
    public DemandeCongedto rejectLeaveRequest(String leaveId, String hrId, String comments) {
        DemandeConge leave = demandeCongeRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        leave.setStatut(StatutDemandeConge.REFUSEE);
        leave.setValidateur(hr);
        leave.setDateValidation(LocalDate.now());
        leave.setCommentaireValidateur(comments != null ? comments : "Leave request rejected");

        DemandeConge savedLeave = demandeCongeRepository.save(leave);
        return convertToDto(savedLeave);
    }

    /**
     * Get leave statistics for dashboard
     */
    public Map<String, Object> getLeaveStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<DemandeConge> allLeaves = demandeCongeRepository.findAll();
        
        // Total counts
        stats.put("totalRequests", allLeaves.size());
        stats.put("pendingRequests", allLeaves.stream()
                .filter(l -> l.getStatut() == StatutDemandeConge.EN_ATTENTE)
                .count());
        stats.put("approvedRequests", allLeaves.stream()
                .filter(l -> l.getStatut() == StatutDemandeConge.ACCEPTEE)
                .count());
        stats.put("rejectedRequests", allLeaves.stream()
                .filter(l -> l.getStatut() == StatutDemandeConge.REFUSEE)
                .count());

        // By type
        Map<TypeConge, Long> byType = allLeaves.stream()
                .collect(Collectors.groupingBy(DemandeConge::getTypeConge, Collectors.counting()));
        stats.put("requestsByType", byType);

        // Current month stats
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        
        long currentMonthRequests = allLeaves.stream()
                .filter(l -> l.getDateCreation() != null && 
                           !l.getDateCreation().isBefore(startOfMonth) && 
                           !l.getDateCreation().isAfter(endOfMonth))
                .count();
        stats.put("currentMonthRequests", currentMonthRequests);

        return stats;
    }

    /**
     * Get employee leave history
     */
    public List<DemandeCongedto> getEmployeeLeaveHistory(String employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        List<DemandeConge> leaves = demandeCongeRepository.findByEmploye(employee);
        return leaves.stream()
                .map(this::convertToDto)
                .sorted((a, b) -> b.getDateCreation().compareTo(a.getDateCreation()))
                .collect(Collectors.toList());
    }

    /**
     * Create leave request for employee
     */
    public DemandeCongedto createLeaveForEmployee(DemandeCongedto leaveRequest, String hrId) {
        User employee = userRepository.findById(leaveRequest.getEmployeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        DemandeConge leave = new DemandeConge();
        leave.setEmploye(employee);
        leave.setValidateur(hr);
        leave.setDateDebut(leaveRequest.getDateDebut());
        leave.setDateFin(leaveRequest.getDateFin());
        leave.setTypeConge(leaveRequest.getTypeConge());
        leave.setRaison(leaveRequest.getRaison());
        leave.setStatut(StatutDemandeConge.ACCEPTEE); // HR created, so auto-approved
        leave.setDateCreation(LocalDate.now());
        leave.setDateValidation(LocalDate.now());
        leave.setNombreJours(calculateWorkingDays(leaveRequest.getDateDebut(), leaveRequest.getDateFin()));

        DemandeConge savedLeave = demandeCongeRepository.save(leave);
        return convertToDto(savedLeave);
    }

    /**
     * Update leave request
     */
    public DemandeCongedto updateLeaveRequest(String leaveId, DemandeCongedto leaveRequest) {
        DemandeConge leave = demandeCongeRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        leave.setDateDebut(leaveRequest.getDateDebut());
        leave.setDateFin(leaveRequest.getDateFin());
        leave.setTypeConge(leaveRequest.getTypeConge());
        leave.setRaison(leaveRequest.getRaison());
        leave.setNombreJours(calculateWorkingDays(leaveRequest.getDateDebut(), leaveRequest.getDateFin()));
        
        if (leaveRequest.getCommentaireValidateur() != null) {
            leave.setCommentaireValidateur(leaveRequest.getCommentaireValidateur());
        }

        DemandeConge savedLeave = demandeCongeRepository.save(leave);
        return convertToDto(savedLeave);
    }

    /**
     * Get leave requests requiring action (pending > 3 days)
     */
    public List<DemandeCongedto> getLeaveRequestsRequiringAction() {
        LocalDate threeDaysAgo = LocalDate.now().minusDays(3);
        List<DemandeConge> leaves = demandeCongeRepository.findByStatut(StatutDemandeConge.EN_ATTENTE);
        
        return leaves.stream()
                .filter(l -> l.getDateCreation() != null && l.getDateCreation().isBefore(threeDaysAgo))
                .map(this::convertToDto)
                .sorted((a, b) -> a.getDateCreation().compareTo(b.getDateCreation()))
                .collect(Collectors.toList());
    }

    /**
     * Get monthly leave calendar
     */
    public List<DemandeCongedto> getMonthlyLeaveCalendar(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<DemandeConge> leaves = demandeCongeRepository.findByDateDebutLessThanEqualAndDateFinGreaterThanEqual(
                endDate, startDate);
        
        return leaves.stream()
                .filter(l -> l.getStatut() == StatutDemandeConge.ACCEPTEE)
                .map(this::convertToDto)
                .sorted((a, b) -> a.getDateDebut().compareTo(b.getDateDebut()))
                .collect(Collectors.toList());
    }

    /**
     * Convert DemandeConge entity to DTO
     */
    private DemandeCongedto convertToDto(DemandeConge leave) {
        DemandeCongedto dto = new DemandeCongedto();
        dto.setId(leave.getId());
        dto.setEmployeId(leave.getEmploye().getId());
        dto.setDateDebut(leave.getDateDebut());
        dto.setDateFin(leave.getDateFin());
        dto.setTypeConge(leave.getTypeConge());
        dto.setStatut(leave.getStatut());
        dto.setRaison(leave.getRaison());
        dto.setNombreJours(leave.getNombreJours());
        dto.setDateCreation(leave.getDateCreation());
        dto.setDateValidation(leave.getDateValidation());
        dto.setCommentaireValidateur(leave.getCommentaireValidateur());
          // Set employee info
        if (leave.getEmploye() != null) {
            dto.setEmployeNom(leave.getEmploye().getName());
            dto.setEmployePrenom(""); // User model only has name field
        }
        
        // Set validator info
        if (leave.getValidateur() != null) {
            dto.setValidateurId(leave.getValidateur().getId());
            dto.setValidateurNom(leave.getValidateur().getName());
            dto.setValidateurPrenom(""); // User model only has name field
        }
        
        return dto;
    }    /**
     * Calculate working days between two dates (excluding weekends)
     */
    private int calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return 0;
        }
        
        int workingDays = 0;
        
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek().getValue() < 6) { // Monday to Friday
                workingDays++;
            }
            current = current.plusDays(1);
        }
        
        return workingDays;
    }
}
