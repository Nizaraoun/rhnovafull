import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    activeJobs: 0,
    totalCandidates: 0,
    activeTeams: 0
  };

  recentActivities = [
    {
      type: 'user',
      icon: 'icon-user-plus',
      title: 'New User Added',
      description: 'John Doe was added as a Team Member',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      type: 'job',
      icon: 'icon-briefcase',
      title: 'Job Offer Posted',
      description: 'Senior Developer position opened',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      type: 'system',
      icon: 'icon-settings',
      title: 'System Update',
      description: 'Security patches applied successfully',
      timestamp: new Date(Date.now() - 10800000)
    }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    // For demo purposes, using mock data
    // In production, use: this.adminService.getDashboardStats().subscribe(...)
    this.stats = {
      totalUsers: 45,
      activeJobs: 12,
      totalCandidates: 78,
      activeTeams: 8
    };
  }
}
