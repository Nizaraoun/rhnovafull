import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

// Import services
import { DashboardService } from '../../shared/services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';

// Import models
import { Role } from '../../shared/models/role.model';
import { DashboardStats, DashboardCard, TeamMember, EmployeeGrowthData } from '../../shared/models/dashboard.model';

@Component({
  selector: 'app-combined-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './combined-admin-dashboard.component.html',
  styleUrls: ['./combined-admin-dashboard.component.scss']
})
export class CombinedAdminDashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private destroy$ = new Subject<void>();

  // Dashboard signals
  dashboardStats = signal<DashboardStats | null>(null);
  statsCards = signal<DashboardCard[]>([]);
  employeeGrowthData = signal<EmployeeGrowthData[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  // Admin stats signals
  adminStats = signal({
    totalUsers: 0,
    activeJobs: 0,
    totalCandidates: 0,
    activeTeams: 0
  });

  // Default activities
  recentActivities = signal<any[]>([
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'submitted application for Senior Developer position',
      time: '2 hours ago',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      user: 'Mike Chen',
      action: 'completed onboarding process',
      time: '4 hours ago',
      status: 'completed',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'scheduled interview for UX Designer role',
      time: '6 hours ago',
      status: 'scheduled',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  // Admin pending tasks
  pendingTasks = signal([
    {
      id: 1,
      title: 'Review Applications',
      description: 'Review new job applications for open positions',
      priority: 'high',
      dueDate: 'Today'
    },
    {
      id: 2,
      title: 'Prepare Onboarding Materials',
      description: 'For new team members starting next week',
      priority: 'medium',
      dueDate: 'Tomorrow'
    },
    {
      id: 3,
      title: 'Update Job Descriptions',
      description: 'Quarterly review of all active job postings',
      priority: 'low',
      dueDate: 'This week'
    },
    {
      id: 4,
      title: 'System Maintenance',
      description: 'Schedule regular system maintenance',
      priority: 'medium',
      dueDate: 'Friday'
    }
  ]);

  // Team members
  teamMembers = signal([
    {
      id: 1,
      name: 'Alex Thompson',
      role: 'HR Manager',
      status: 'online',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Lisa Wang',
      role: 'Recruiter',
      status: 'busy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'David Miller',
      role: 'Team Lead',
      status: 'away',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f8d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Rachel Green',
      role: 'HR Specialist',
      status: 'online',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  ngOnInit() {
    // Check if user is admin
    const userRole = this.authService.getUserRole();
    if (userRole !== Role.ADMIN) {
      // Redirect non-admin users
      return;
    }

    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({        next: (stats) => {
          this.dashboardStats.set(stats);
          this.updateStatsCards(stats);
          this.employeeGrowthData.set(stats.employeeGrowthData);
            // Update activities with API data
          if (stats.recentActivities && stats.recentActivities.length > 0) {
            this.recentActivities.set(stats.recentActivities.map((activity: any) => ({
              ...activity,
              avatar: activity.avatar || 'assets/images/default-avatar.png',
              status: this.mapActivityStatus(activity.status)
            })));
          }
          
          this.isLoading.set(false);
        },error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error.set('Failed to load dashboard data. Please try again.');
          this.isLoading.set(false);
          this.loadFallbackData();
        }
      });
  }

  private loadAdminStats() {
    // Load admin-specific statistics
    this.adminStats.set({
      totalUsers: 247,
      activeJobs: 15,
      totalCandidates: 150,
      activeTeams: 8
    });
  }

  private updateStatsCards(stats: DashboardStats) {    this.statsCards.set([
      {
        title: 'Total Employees',
        value: stats.totalEmployees,
        change: '+12%',
        changeType: 'increase',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
        color: 'blue'
      },
      {
        title: 'Active Job Offers',
        value: stats.totalActiveJobOffers,
        change: '+5%',
        changeType: 'increase',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>',
        color: 'green'
      },
      {
        title: 'Total Candidates',
        value: stats.totalCandidates,
        change: '+23%',
        changeType: 'increase',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
        color: 'purple'
      },
      {
        title: 'Job Applications',
        value: stats.jobApplications,
        change: stats.jobApplications > 0 ? '+' + Math.floor(Math.random() * 15) + '%' : '0%',
        changeType: stats.jobApplications > 0 ? 'increase' : 'neutral',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        color: 'amber'
      }]);
  }

  private loadFallbackData() {
    const fallbackStats: DashboardStats = {
      totalEmployees: 247,
      newHires: 23,
      jobApplications: 89,
      pendingReviews: 12,
      totalTeams: 8,
      totalActiveJobOffers: 15,
      totalCandidates: 150,
      interviewsThisWeek: 8,
      completedTasksThisWeek: 25,
      pendingTasksCount: 12,
      employeeGrowthData: [
        { day: 'Mon', count: 95 },
        { day: 'Tue', count: 82 },
        { day: 'Wed', count: 78 },
        { day: 'Thu', count: 90 },
        { day: 'Fri', count: 88 },
        { day: 'Sat', count: 76 },
        { day: 'Sun', count: 85 }
      ],
      recentActivities: []
    };

    this.dashboardStats.set(fallbackStats);
    this.updateStatsCards(fallbackStats);
    this.employeeGrowthData.set(fallbackStats.employeeGrowthData);
  }


  getMaxCount(): number {
    const data = this.employeeGrowthData();
    return data.length > 0 ? Math.max(...data.map(d => d.count)) : 100;
  }
  refreshDashboard() {
    this.loadDashboardData();
  }
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/default-avatar.png';
  }

  private mapActivityStatus(apiStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'PLANIFIE': 'scheduled',
      'TERMINE': 'completed',
      'TERMINEE': 'completed',
      'EN_COURS': 'pending',
      'A_FAIRE': 'pending'
    };
    return statusMap[apiStatus] || 'pending';
  }
}
