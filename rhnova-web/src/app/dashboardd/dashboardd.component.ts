import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DashboardService } from '../shared/services/dashboard.service';
import { AuthService } from '../auth/services/auth.service';
import { Role } from '../shared/models/role.model';
import { DashboardStats, DashboardCard, TeamMember, EmployeeGrowthData } from '../shared/models/dashboard.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboardd',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboardd.component.html',
  styleUrl: './dashboardd.component.scss'
})
export class DashboarddComponent implements OnInit, OnDestroy {  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private destroy$ = new Subject<void>();
  
  // Signals for reactive data
  dashboardStats = signal<DashboardStats | null>(null);
  isAdmin = signal<boolean>(false);
  statsCards = signal<DashboardCard[]>([]);
  employeeGrowthData = signal<EmployeeGrowthData[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  // Default activities when API returns empty array




 ngOnInit() {
    // Check user role and redirect non-admin users immediately
    const userRole = this.authService.getUserRole();
    
    if (userRole !== Role.ADMIN) {
      // Redirect non-admin users to their appropriate dashboards
      switch (userRole) {
        case Role.CANDIDAT:
          this.router.navigate(['/candidate/dashboard']);
          return;
        case Role.RESPONSABLERH:
          this.router.navigate(['/hr/dashboard']);
          return;
        case Role.MANAGER:
          this.router.navigate(['/manager/dashboard']);
          return;
        case Role.MEMBRE_EQUIPE:
          this.router.navigate(['/team-member/dashboard']);
          return;
        default:
          this.router.navigate(['/auth/login']);
          return;
      }
    }
    
    // If user is admin, load dashboard data
    this.isAdmin.set(true);
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
      .subscribe({
        next: (stats) => {
          this.dashboardStats.set(stats);
          this.updateStatsCards(stats);
          this.employeeGrowthData.set(stats.employeeGrowthData);
            // Update activities if provided by API
       
          
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error.set('Failed to load dashboard data. Please try again.');
          this.isLoading.set(false);
          
          // Load fallback data
        }
      });
  }

  private updateStatsCards(stats: DashboardStats) {
    this.statsCards.set([
      {
        title: 'Total Employees',
        value: stats.totalEmployees,
        change: this.calculateChange(stats.totalEmployees, 'increase'),
        changeType: 'increase',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
        color: 'blue'
      },
      {
        title: 'New Hires',
        value: stats.newHires,
        change: this.calculateChange(stats.newHires, stats.newHires > 0 ? 'increase' : 'neutral'),
        changeType: stats.newHires > 0 ? 'increase' : 'neutral',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
        color: 'green'
      },
      {
        title: 'Job Applications',
        value: stats.jobApplications,
        change: this.calculateChange(stats.jobApplications, stats.jobApplications > 0 ? 'increase' : 'neutral'),
        changeType: stats.jobApplications > 0 ? 'increase' : 'neutral',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>',
        color: 'purple'
      },
      {
        title: 'Pending Reviews',
        value: stats.pendingReviews,
        change: this.calculateChange(stats.pendingReviews, stats.pendingReviews > 0 ? 'increase' : 'neutral'),
        changeType: stats.pendingReviews > 0 ? 'increase' : 'neutral',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
        color: 'amber'
      }
    ]);
  }

  private calculateChange(value: number, type: 'increase' | 'decrease' | 'neutral'): string {
    if (value === 0) return '0%';
    
    // Simple calculation for demo purposes
    const percentage = Math.floor(Math.random() * 15) + 1;
    const sign = type === 'increase' ? '+' : type === 'decrease' ? '-' : '';
    return `${sign}${percentage}%`;
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
}
