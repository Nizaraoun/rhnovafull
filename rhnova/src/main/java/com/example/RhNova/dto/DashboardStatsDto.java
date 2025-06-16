package com.example.RhNova.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {
    private Long totalEmployees;
    private Long newHires; // Employees added in last 30 days
    private Long jobApplications; // Total active applications
    private Long pendingReviews; // Pending interviews + pending tasks
    
    // Growth data for charts (last 7 days)
    private List<Map<String, Object>> employeeGrowthData;
    
    // Recent activities
    private List<RecentActivityDto> recentActivities;
    
    // Pending tasks count
    private Long pendingTasksCount;
    
    // Team statistics
    private Long totalTeams;
    private Long totalActiveJobOffers;
    
    // Additional stats
    private Long totalCandidates;
    private Long interviewsThisWeek;
    private Long completedTasksThisWeek;
}
