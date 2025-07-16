import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamMemberService, TeamMemberTask, DetailedTeam } from '../services/team-member.service';
import { LeaveManagementService, LeaveRequest, StatutDemandeConge } from '../../hr/leave-management/leave-management.service';

interface DashboardTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date;
  progress: number;
}

interface DashboardStats {
  myTasks: number;
  completedTasks: number;
  pendingTasks: number;
  leaveBalance: number;
}

interface TeamInfo {
  name: string;
  manager: string;
  members: number;
  currentSprint: string;
}

interface Activity {
  id: string;
  action: string;
  task: string;
  timestamp: Date;
}

@Component({
  selector: 'app-team-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-member-dashboard.component.html',
  styleUrls: ['./team-member-dashboard.component.scss']
})
export class TeamMemberDashboardComponent implements OnInit {
  dashboardStats: DashboardStats = {
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    leaveBalance: 0
  };

  myTasks: DashboardTask[] = [];
  recentActivities: Activity[] = [];
  teamInfo: TeamInfo = {
    name: 'Loading...',
    manager: 'Loading...',
    members: 0,
    currentSprint: 'Loading...'
  };

  isLoading = false;
  error: string | null = null;

  constructor(
    private teamMemberService: TeamMemberService,
    private leaveManagementService: LeaveManagementService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Load all dashboard data concurrently
    Promise.all([
      this.loadMyTasks(),
      this.loadTeamInfo(),
      this.loadLeaveBalance()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private async loadMyTasks(): Promise<void> {
    try {
      const apiTasks = await this.teamMemberService.getMyTasks().toPromise();
      
      if (apiTasks && apiTasks.length > 0) {
        // Map API tasks to dashboard tasks (show only first 3)
        this.myTasks = apiTasks.slice(0, 3).map(task => this.mapApiTaskToDashboardTask(task));
        
        // Calculate stats
        this.dashboardStats.myTasks = apiTasks.length;
        this.dashboardStats.completedTasks = apiTasks.filter(t => t.statut === 'TERMINEE').length;
        this.dashboardStats.pendingTasks = apiTasks.filter(t => t.statut === 'A_FAIRE').length;
        
        // Generate recent activities from tasks
        this.generateRecentActivities(apiTasks);
      } else {
        // Fallback to mock data if no tasks
        this.loadMockTaskData();
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.loadMockTaskData();
    }
  }

  private async loadTeamInfo(): Promise<void> {
    try {
      const teamDetails = await this.teamMemberService.getMyTeamDetails().toPromise();
      
      if (teamDetails) {
        this.teamInfo = {
          name: teamDetails.nom,
          manager: teamDetails.manager?.name || 'Non assigné',
          members: teamDetails.membres?.length || 0,
          currentSprint: 'Sprint en cours' // This could be fetched from another service
        };
      } else {
        this.loadMockTeamInfo();
      }
    } catch (error) {
      console.error('Error loading team info:', error);
      this.loadMockTeamInfo();
    }
  }

  private async loadLeaveBalance(): Promise<void> {
    try {
      const leaveRequests = await this.leaveManagementService.getMyLeaveRequests().toPromise();
      
      if (leaveRequests) {
        // Calculate remaining leave days (assuming 25 days per year)
        const usedDays = leaveRequests
          .filter((req: LeaveRequest) => req.statut === StatutDemandeConge.ACCEPTEE)
          .reduce((total: number, req: LeaveRequest) => total + req.nombreJours, 0);
        
        this.dashboardStats.leaveBalance = Math.max(25 - usedDays, 0);
      } else {
        this.dashboardStats.leaveBalance = 15; // Default fallback
      }
    } catch (error) {
      console.error('Error loading leave balance:', error);
      this.dashboardStats.leaveBalance = 15; // Default fallback
    }
  }

  private mapApiTaskToDashboardTask(apiTask: TeamMemberTask): DashboardTask {
    return {
      id: apiTask.id,
      title: apiTask.titre,
      description: apiTask.description,
      status: this.mapApiStatusToDisplayStatus(apiTask.statut),
      priority: this.mapApiPriorityToDisplayPriority(apiTask.priorite),
      dueDate: new Date(apiTask.dateFin),
      progress: apiTask.progression
    };
  }

  private mapApiStatusToDisplayStatus(apiStatus: string): string {
    switch (apiStatus) {
      case 'A_FAIRE': return 'Pending';
      case 'EN_COURS': return 'In Progress';
      case 'TERMINEE': return 'Completed';
      default: return 'Pending';
    }
  }

  private mapApiPriorityToDisplayPriority(apiPriority: string): string {
    switch (apiPriority) {
      case 'BASSE': return 'Low';
      case 'MOYENNE': return 'Medium';
      case 'HAUTE': return 'High';
      default: return 'Medium';
    }
  }

  private generateRecentActivities(tasks: TeamMemberTask[]): void {
    // Generate activities based on task updates and completion dates
    this.recentActivities = [];
    
    // Get recently updated tasks
    const recentTasks = tasks
      .filter(task => task.lastUpdated)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5);

    recentTasks.forEach((task, index) => {
      let action = 'Progression mise à jour';
      if (task.statut === 'TERMINEE') {
        action = 'Tâche terminée';
      } else if (task.statut === 'EN_COURS') {
        action = 'Début du travail sur';
      }

      this.recentActivities.push({
        id: `activity-${index}`,
        action: action,
        task: task.titre,
        timestamp: new Date(task.lastUpdated)
      });
    });

    // If no recent activities, create some mock ones
    if (this.recentActivities.length === 0) {
      this.generateMockActivities();
    }
  }

  private loadMockTaskData(): void {
    this.myTasks = [
    
    ];

    this.dashboardStats = {
      myTasks: 8,
      completedTasks: 5,
      pendingTasks: 3,
      leaveBalance: 15
    };

    this.generateMockActivities();
  }

  private loadMockTeamInfo(): void {
    this.teamInfo = {
      name: 'Équipe Développement',
      manager: 'Jean Dupont',
      members: 5,
      currentSprint: 'Sprint 3'
    };
  }

  private generateMockActivities(): void {
    this.recentActivities = [
      {
        id: '1',
        action: 'Tâche terminée',
        task: 'Conception du schéma de base de données',
        timestamp: new Date('2025-06-25T14:30:00')
      },
      {
        id: '2',
        action: 'Progression mise à jour',
        task: 'Module d\'authentification utilisateur',
        timestamp: new Date('2025-06-25T11:15:00')
      },
      {
        id: '3',
        action: 'Début du travail sur',
        task: 'Intégration API',
        timestamp: new Date('2025-06-24T16:45:00')
      }
    ];
  }

  // Public methods for user interactions
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  getTaskPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'in progress': return 'status-in-progress';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  updateTaskProgress(taskId: string, progress: number): void {
    const task = this.myTasks.find(t => t.id === taskId);
    if (task) {
      task.progress = progress;
      if (progress === 100) {
        task.status = 'Completed';
      }
      
      // Update task via service
      this.teamMemberService.updateTaskProgress(taskId, progress).subscribe({
        next: (updatedTask) => {
          console.log('Task progress updated successfully:', updatedTask);
          // Refresh dashboard stats
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error updating task progress:', error);
        }
      });
    }
  }

  // Check if a task is overdue
  isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate);
  }

  // Get days until due date
  getDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Format relative time for activities
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }
}
