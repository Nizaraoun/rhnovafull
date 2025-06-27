import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, ManagerTask } from '../services/manager.service';

interface TaskProgress {
  id: number;
  title: string;
  assignee: string;
  team: string;
  status: 'Not Started' | 'In Progress' | 'Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: Date;
  progress: number;
  estimatedHours: number;
  actualHours: number;
}

interface TeamPerformance {
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  efficiency: number;
}

@Component({
  selector: 'app-progress-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './progress-tracking.component.html',
  styleUrls: ['./progress-tracking.component.scss']
})
export class ProgressTrackingComponent implements OnInit {
  tasks: TaskProgress[] = [];
  teamPerformance: TeamPerformance[] = [];
  selectedPeriod = '7days';
  selectedTeam = 'all';
  isLoading = false;
  
  periodOptions = [
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '3months', label: '3 derniers mois' },
    { value: 'year', label: 'Cette année' }
  ];

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadProgressData();
  }
  loadProgressData(): void {
    this.isLoading = true;
    this.managerService.getMyTeamTasks().subscribe({
      next: (apiTasks) => {
        this.tasks = apiTasks.map(apiTask => this.mapApiTaskToTaskProgress(apiTask));
        this.calculateTeamPerformance();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading progress data:', error);
        this.isLoading = false;
        // Fallback to mock data if API fails
        this.loadMockProgressData();
      }
    });
  }

  private mapApiTaskToTaskProgress(apiTask: ManagerTask): TaskProgress {
    return {
      id: parseInt(apiTask.id) || 1,
      title: apiTask.titre,
      assignee: apiTask.membreName || 'Unassigned',
      team: 'Développement', // This could come from team data
      status: this.mapApiStatusToUIStatus(apiTask.statut),
      priority: this.mapApiPriorityToUIPriority(apiTask.priorite),
      dueDate: new Date(apiTask.dateFin),
      progress: apiTask.progression,
      estimatedHours: 24, // This would need to come from API or be added to the model
      actualHours: Math.floor(apiTask.progression * 24 / 100) // Estimated based on progress
    };
  }

  private mapApiStatusToUIStatus(apiStatus: string): 'Not Started' | 'In Progress' | 'Review' | 'Completed' {
    switch (apiStatus) {
      case 'A_FAIRE': return 'Not Started';
      case 'EN_COURS': return 'In Progress';
      case 'TERMINEE': return 'Completed';
      default: return 'Not Started';
    }
  }

  private mapApiPriorityToUIPriority(apiPriority: string): 'Low' | 'Medium' | 'High' | 'Urgent' {
    switch (apiPriority) {
      case 'BASSE': return 'Low';
      case 'MOYENNE': return 'Medium';
      case 'HAUTE': return 'High';
      default: return 'Medium';
    }
  }

  private calculateTeamPerformance(): void {
    // Group tasks by team
    const teamTasks = this.tasks.reduce((acc, task) => {
      if (!acc[task.team]) {
        acc[task.team] = [];
      }
      acc[task.team].push(task);
      return acc;
    }, {} as { [key: string]: TaskProgress[] });

    // Calculate performance metrics for each team
    this.teamPerformance = Object.keys(teamTasks).map(teamName => {
      const tasks = teamTasks[teamName];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const overdueTasks = tasks.filter(t => this.isOverdue(t.dueDate) && t.status !== 'Completed').length;
      
      const averageCompletionTime = this.calculateAverageCompletionTime(tasks);
      const efficiency = this.calculateEfficiency(tasks);

      return {
        teamName,
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        averageCompletionTime,
        efficiency
      };
    });
  }

  private calculateAverageCompletionTime(tasks: TaskProgress[]): number {
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    if (completedTasks.length === 0) return 0;
    
    // This is a simple estimation - in reality, you'd need actual completion dates
    const avgHours = completedTasks.reduce((sum, task) => sum + task.actualHours, 0) / completedTasks.length;
    return Math.round(avgHours / 8 * 10) / 10; // Convert to days
  }

  private calculateEfficiency(tasks: TaskProgress[]): number {
    if (tasks.length === 0) return 0;
    
    const totalEstimated = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActual = tasks.reduce((sum, task) => sum + task.actualHours, 0);
    
    if (totalActual === 0) return 100;
    return Math.round((totalEstimated / totalActual) * 100);
  }

  private loadMockProgressData(): void {
    // Mock data - replace with actual service call
    this.tasks = [
  
    ];

    this.teamPerformance = [

    ];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Not Started': return 'status-not-started';
      case 'In Progress': return 'status-in-progress';
      case 'Review': return 'status-review';
      case 'Completed': return 'status-completed';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Low': return 'priority-low';
      case 'Medium': return 'priority-medium';
      case 'High': return 'priority-high';
      case 'Urgent': return 'priority-urgent';
      default: return '';
    }
  }

  isOverdue(dueDate: Date): boolean {
    return new Date() > dueDate;
  }

  getCompletionRate(team: TeamPerformance): number {
    return team.totalTasks > 0 ? Math.round((team.completedTasks / team.totalTasks) * 100) : 0;
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#27ae60';
    if (progress >= 50) return '#f39c12';
    return '#e74c3c';
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadProgressData(); // Reload data based on new period
  }

  onTeamChange(team: string): void {
    this.selectedTeam = team;
    // Filter tasks based on selected team
  }

  getFilteredTasks(): TaskProgress[] {
    if (this.selectedTeam === 'all') {
      return this.tasks;
    }
    return this.tasks.filter(task => task.team === this.selectedTeam);
  }

  getOverallStats() {
    const filteredTasks = this.getFilteredTasks();
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'Completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'In Progress').length;
    const overdue = filteredTasks.filter(t => this.isOverdue(t.dueDate) && t.status !== 'Completed').length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}
