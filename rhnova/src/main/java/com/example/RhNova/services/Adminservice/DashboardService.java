package com.example.RhNova.services.Adminservice;

import com.example.RhNova.dto.DashboardStatsDto;
import com.example.RhNova.dto.RecentActivityDto;
import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.entity.ResponRH.Entretien;
import com.example.RhNova.model.entity.Tache;
import com.example.RhNova.model.entity.Employe;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.enums.StatutTache;
import com.example.RhNova.model.enums.StatutEntretien;
import com.example.RhNova.model.enums.StatutDemandeConge;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.Candidatrepo.CandidatureRepository;
import com.example.RhNova.repositories.HRrepo.EntretienRepository;
import com.example.RhNova.repositories.HRrepo.JobOfferRepository;
import com.example.RhNova.repositories.HRrepo.EmployeRepository;
import com.example.RhNova.repositories.Managerepo.EquipeRepository;
import com.example.RhNova.repositories.TacheRepository;
import com.example.RhNova.repositories.DemandeCongeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CandidatureRepository candidatureRepository;
    
    @Autowired
    private EntretienRepository entretienRepository;
    
    @Autowired
    private JobOfferRepository jobOfferRepository;
    
    @Autowired
    private EquipeRepository equipeRepository;
    
    @Autowired
    private TacheRepository tacheRepository;
    
    @Autowired
    private EmployeRepository employeRepository;
    
    @Autowired
    private DemandeCongeRepository demandeCongeRepository;    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        // Basic counts
        stats.setTotalEmployees(employeRepository.count()); // Real employee count
        stats.setNewHires(getNewHiresCount());
        stats.setJobApplications(candidatureRepository.count());
        stats.setPendingReviews(getPendingReviewsCount());
        stats.setTotalTeams(equipeRepository.count());
        stats.setTotalActiveJobOffers(getActiveJobOffersCount());
        stats.setTotalCandidates(getUserCountByRole(Role.CANDIDAT));
        stats.setPendingTasksCount(getPendingTasksCount());
        
        // New statistics
        stats.setInterviewsThisWeek(getInterviewsThisWeekCount());
        stats.setCompletedTasksThisWeek(getCompletedTasksThisWeekCount());
        
        // Real growth data based on actual employee hire dates
        stats.setEmployeeGrowthData(getRealEmployeeGrowthData());
        
        // Recent activities based on real data
        stats.setRecentActivities(getRecentActivities());
        
        return stats;
    }    private Long getNewHiresCount() {
        // Count employees hired in the last 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        return (long) employeRepository.findByJoinDateAfter(thirtyDaysAgo).size();
    }    private Long getPendingReviewsCount() {
        // Count pending interviews (PLANIFIE, CONFIRME)
        long pendingInterviews = entretienRepository.findByStatut(StatutEntretien.PLANIFIE).size() + 
                                entretienRepository.findByStatut(StatutEntretien.CONFIRME).size();
        
        // Count pending tasks (A_FAIRE, EN_COURS)
        long pendingTasks = tacheRepository.findByStatut(StatutTache.A_FAIRE).size() + 
                           tacheRepository.findByStatut(StatutTache.EN_COURS).size();
        
        // Count pending leave requests
        long pendingLeaveRequests = demandeCongeRepository.findByStatut(StatutDemandeConge.EN_ATTENTE).size();
        
        return pendingInterviews + pendingTasks + pendingLeaveRequests;
    }private Long getActiveJobOffersCount() {
        return (long) jobOfferRepository.findAllNonArchived().size();
    }

    private Long getUserCountByRole(Role role) {
        return (long) userRepository.findAll().stream()
                .mapToInt(user -> user.getRole() == role ? 1 : 0)
                .sum();
    }

    

    private Long getPendingTasksCount() {
        return (long) (tacheRepository.findByStatut(StatutTache.A_FAIRE).size() + 
                      tacheRepository.findByStatut(StatutTache.EN_COURS).size());
    }    private List<Map<String, Object>> getRealEmployeeGrowthData() {
        // Get employee growth data for the last 7 days based on join dates
        List<Map<String, Object>> growthData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            List<Employe> employeesJoinedOnDate = employeRepository.findByJoinDateAfter(date.minusDays(1))
                    .stream()
                    .filter(emp -> emp.getJoinDate() != null && emp.getJoinDate().equals(date))
                    .collect(Collectors.toList());
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", date.format(DateTimeFormatter.ofPattern("EEE")));
            dayData.put("count", employeesJoinedOnDate.size());
            dayData.put("date", date);
            growthData.add(dayData);
        }
        
        return growthData;
    }

    private Long getInterviewsThisWeekCount() {
        LocalDate startOfWeek = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);
        
        return (long) entretienRepository.findByDateEntretienBetween(startOfWeek, endOfWeek).size();
    }    private Long getCompletedTasksThisWeekCount() {
        // Count tasks completed this week
        LocalDate startOfWeek = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1);
        
        return (long) tacheRepository.findByStatut(StatutTache.TERMINEE).stream()
                .filter(task -> task.getDateFin() != null && 
                               !task.getDateFin().isBefore(startOfWeek) && 
                               !task.getDateFin().isAfter(LocalDate.now()))
                .count();
    }

    private List<RecentActivityDto> getRecentActivities() {
        List<RecentActivityDto> activities = new ArrayList<>();
        
        // Recent interviews
        List<Entretien> recentInterviews = entretienRepository.findAll().stream()
                .filter(interview -> interview.getDateCreation() != null)
                .sorted((a, b) -> b.getDateCreation().compareTo(a.getDateCreation()))
                .limit(5)
                .collect(Collectors.toList());
        
        for (Entretien interview : recentInterviews) {
            RecentActivityDto activity = new RecentActivityDto();
            activity.setId(interview.getId());
            activity.setUser("HR Team");
            activity.setAction("Interview scheduled");
            activity.setTime(getRelativeTime(interview.getDateCreation()));
            activity.setStatus(interview.getStatut().toString());
            activity.setTimestamp(interview.getDateCreation());
            activities.add(activity);
        }
        
        // Recent task updates
        List<Tache> recentTasks = tacheRepository.findAll().stream()
                .filter(task -> task.getDateDebut() != null)
                .sorted((a, b) -> b.getDateDebut().compareTo(a.getDateDebut()))
                .limit(5)
                .collect(Collectors.toList());
        
        for (Tache task : recentTasks) {
            RecentActivityDto activity = new RecentActivityDto();
            activity.setId(task.getId());
            activity.setUser(task.getMembre() != null ? task.getMembre().getName() : "Unknown");
            activity.setAction("Task updated");
            activity.setTime(getRelativeTime(task.getDateDebut().atStartOfDay()));
            activity.setStatus(task.getStatut().toString());
            activity.setTimestamp(task.getDateDebut().atStartOfDay());
            activities.add(activity);
        }
        
        // Sort all activities by timestamp and limit to 10
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(10)
                .collect(Collectors.toList());
    }
    private String getRelativeTime(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long hours = java.time.Duration.between(dateTime, now).toHours();
        
        if (hours < 1) {
            return "just now";
        } else if (hours < 24) {
            return hours + " hours ago";
        } else {
            long days = hours / 24;
            return days + " days ago";
        }
    }    public List<Tachedto> getPendingTasks() {
        List<Tache> pendingTasks = new ArrayList<>();
        pendingTasks.addAll(tacheRepository.findByStatut(StatutTache.A_FAIRE));
        pendingTasks.addAll(tacheRepository.findByStatut(StatutTache.EN_COURS));
        
        return pendingTasks.stream()
                .sorted((t1, t2) -> {
                    // Sort by priority first, then by date
                    int priorityCompare = t1.getPriorite().compareTo(t2.getPriorite());
                    if (priorityCompare != 0) return priorityCompare;
                    
                    // If priorities are equal, sort by start date
                    if (t1.getDateDebut() != null && t2.getDateDebut() != null) {
                        return t1.getDateDebut().compareTo(t2.getDateDebut());
                    }
                    return 0;
                })
                .map(this::convertTacheToDto)
                .limit(15) // Return top 15 pending tasks for better dashboard view
                .collect(Collectors.toList());
    }

    private Tachedto convertTacheToDto(Tache tache) {
        Tachedto dto = new Tachedto();
        dto.setId(tache.getId());
        dto.setTitre(tache.getTitre());
        dto.setDescription(tache.getDescription());
        dto.setPriorite(tache.getPriorite());
        dto.setDateDebut(tache.getDateDebut());
        dto.setDateFin(tache.getDateFin());
        dto.setStatut(tache.getStatut());
        dto.setProgression(tache.getProgression());
        dto.setEvaluation(tache.getEvaluation());
        if (tache.getMembre() != null) {
            dto.setMembreId(tache.getMembre().getId());
        }
        return dto;
    }
}
