package com.example.RhNova.controllers.AdminController;

import com.example.RhNova.dto.DashboardStatsDto;
import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.services.Adminservice.DashboardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDto getDashboardStats() {
        return dashboardService.getDashboardStats();
    }

    @GetMapping("/pending-tasks")
    public List<Tachedto> getPendingTasks() {
        return dashboardService.getPendingTasks();
    }
}
