package com.example.RhNova.services.Adminservice;

import com.example.RhNova.dto.DashboardStatsDto;
import com.example.RhNova.dto.RecentActivityDto;
import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.entity.Candidat.Candidature;
import com.example.RhNova.model.entity.ResponRH.Entretien;
import com.example.RhNova.model.entity.Tache;
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.enums.StatutTache;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.Candidatrepo.CandidatureRepository;
import com.example.RhNova.repositories.HRrepo.EntretienRepository;
import com.example.RhNova.repositories.HRrepo.JobOfferRepository;
import com.example.RhNova.repositories.Managerepo.EquipeRepository;
import com.example.RhNova.repositories.TacheRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        // Basic counts
        stats.setTotalEmployees(userRepository.count());
        stats.setNewHires(getNewHiresCount());
        stats.setJobApplications(candidatureRepository.count());
        stats.setPendingReviews(getPendingReviewsCount());
        stats.setTotalTeams(equipeRepository.count());
        stats.setTotalActiveJobOffers(getActiveJobOffersCount());
        stats.setTotalCandidates(getUserCountByRole(Role.CANDIDAT));
        stats.setInterviewsThisWeek(getInterviewsThisWeekCount());
        stats.setCompletedTasksThisWeek(getCompletedTasksThisWeekCount());
        stats.setPendingTasksCount(getPendingTasksCount());
        
        // Growth data (simplified for now)
        stats.setEmployeeGrowthData(getEmployeeGrowthData());
        
        // Recent activities
        stats.setRecentActivities(getRecentActivities());
        
        return stats;
    }    private Long getNewHiresCount() {
        // Count users created in the last 30 days
        // Since we don't have a createdAt field, we'll return a sample count
        return (long) Math.max(0, userRepository.findAll().size() / 10); // Sample calculation
    }

    private Long getPendingReviewsCount() {
        // Count pending interviews + pending tasks
        long pendingInterviews = entretienRepository.count(); // All interviews for now
        long pendingTasks = tacheRepository.findByStatut(StatutTache.A_FAIRE).size() + 
                           tacheRepository.findByStatut(StatutTache.EN_COURS).size();
        return pendingInterviews + pendingTasks;
    }    private Long getActiveJobOffersCount() {
        return (long) jobOfferRepository.findAllNonArchived().size();
    }

    private Long getUserCountByRole(Role role) {
        return (long) userRepository.findAll().stream()
                .mapToInt(user -> user.getRole() == role ? 1 : 0)
                .sum();
    }

    private Long getInterviewsThisWeekCount() {
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        return entretienRepository.findAll().stream()
                .filter(entretien -> entretien.getDateHeure() != null && 
                                   entretien.getDateHeure().isAfter(weekStart))
                .count();
    }    private Long getCompletedTasksThisWeekCount() {
        return (long) tacheRepository.findByStatut(StatutTache.TERMINEE).size();
    }

    private Long getPendingTasksCount() {
        return (long) (tacheRepository.findByStatut(StatutTache.A_FAIRE).size() + 
                      tacheRepository.findByStatut(StatutTache.EN_COURS).size());
    }

    private List<Map<String, Object>> getEmployeeGrowthData() {
        // Sample data for the last 7 days
        List<Map<String, Object>> growthData = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        Random random = new Random();
        
        for (String day : days) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", day);
            dayData.put("count", 60 + random.nextInt(40)); // Random data between 60-100
            growthData.add(dayData);
        }
        
        return growthData;
    }

    private List<RecentActivityDto> getRecentActivities() {
        List<RecentActivityDto> activities = new ArrayList<>();
        
        // Get recent candidatures
        List<Candidature> recentCandidatures = candidatureRepository.findAll().stream()
                .sorted((a, b) -> b.getDateCandidature().compareTo(a.getDateCandidature()))
                .limit(5)
                .collect(Collectors.toList());
        
        for (Candidature candidature : recentCandidatures) {
            RecentActivityDto activity = new RecentActivityDto();
            activity.setId(candidature.getId());
            activity.setUser(candidature.getCandidat().getName());
            activity.setAction("submitted application for " + candidature.getOffre().getTitre());
            activity.setTime(getRelativeTime(candidature.getDateCandidature().atStartOfDay()));
            activity.setStatus("pending");
            activity.setAvatar("https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=40&h=40&fit=crop&crop=face");
            activity.setTimestamp(candidature.getDateCandidature().atStartOfDay());
            activities.add(activity);
        }
        
        // Get recent interviews
        List<Entretien> recentEntretiens = entretienRepository.findAll().stream()
                .filter(entretien -> entretien.getDateHeure() != null)
                .sorted((a, b) -> b.getDateHeure().compareTo(a.getDateHeure()))
                .limit(3)
                .collect(Collectors.toList());
        
        for (Entretien entretien : recentEntretiens) {
            RecentActivityDto activity = new RecentActivityDto();
            activity.setId(entretien.getId());
            activity.setUser(entretien.getCandidat().getName());
            activity.setAction("scheduled interview for " + entretien.getOffre().getTitre());
            activity.setTime(getRelativeTime(entretien.getDateHeure()));
            activity.setStatus("scheduled");
            activity.setAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face");
            activity.setTimestamp(entretien.getDateHeure());
            activities.add(activity);
        }
        
        // Sort by timestamp and return top 5
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(5)
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
    }

    public List<Tachedto> getPendingTasks() {
        List<Tache> pendingTasks = new ArrayList<>();
        pendingTasks.addAll(tacheRepository.findByStatut(StatutTache.A_FAIRE));
        pendingTasks.addAll(tacheRepository.findByStatut(StatutTache.EN_COURS));
        
        return pendingTasks.stream()
                .map(this::convertTacheToDto)
                .limit(10) // Return top 10 pending tasks
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
