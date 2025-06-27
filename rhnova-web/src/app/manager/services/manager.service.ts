import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../shared/services/base-http.service';

export interface ManagerTask {
  id: string;
  titre: string;
  description: string;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE';
  dateDebut: string;
  dateFin: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  membreId?: string;
  membreName?: string;
  progression: number;
  evaluation?: number;
  createdById: string;
  createdByName: string;
  dateCreation: string;
  lastUpdated: string;
}

export interface CreateTaskRequest {
  titre: string;
  description: string;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE';
  dateDebut: string;
  dateFin: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  role: string;
}

export interface DetailedTeam {
  id: string;
  nom: string;
  description: string;
  manager: TeamMember | null;
  membres: TeamMember[];
  nombreMembres?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerService extends BaseHttpService {

  constructor(http: HttpClient) {
    super(http);
  }  // Team-related methods
  getMyTeamDetails(): Observable<DetailedTeam> {
    return this.get<DetailedTeam>('/api/equipes/manager-details');
  }

  // Alternative method that uses the working endpoint
  getMyTeam(): Observable<DetailedTeam> {
    return this.get<DetailedTeam>('/api/equipes/my-team');
  }

  // Task management methods for managers
  createTask(task: CreateTaskRequest): Observable<ManagerTask> {
    return this.post<ManagerTask>('/api/taches/manager/create', task);
  }

  assignTask(taskId: string, memberId: string): Observable<void> {
    return this.post<void>(`/api/taches/manager/assign/${taskId}/${memberId}`, {});
  }

  getMyTeamTasks(): Observable<ManagerTask[]> {
    return this.get<ManagerTask[]>('/api/taches/manager/my-team-tasks');
  }

  getTasksByStatus(status: string): Observable<ManagerTask[]> {
    return this.get<ManagerTask[]>(`/api/taches/manager/team-tasks/status/${status}`);
  }

  evaluateTask(taskId: string, evaluation: number): Observable<ManagerTask> {
    return this.patch<ManagerTask>(
      `/api/taches/manager/${taskId}/evaluate?evaluation=${evaluation}`,
      {}
    );
  }

  getTaskDetails(taskId: string): Observable<ManagerTask> {
    return this.get<ManagerTask>(`/api/taches/details/${taskId}`);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.delete<void>(`/api/taches/${taskId}`);
  }

  updateTaskStatus(taskId: string, status: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE'): Observable<ManagerTask> {
    return this.patch<ManagerTask>(`/api/taches/manager/${taskId}/status?status=${status}`, {});
  }

  updateTask(taskId: string, updates: Partial<CreateTaskRequest>): Observable<ManagerTask> {
    return this.put<ManagerTask>(`/api/taches/manager/${taskId}`, updates);
  }

  updateTaskProgress(taskId: string, progress: number): Observable<ManagerTask> {
    return this.patch<ManagerTask>(`/api/taches/manager/${taskId}/progress?progress=${progress}`, {});
  }

  // Team statistics and member performance
  getTeamTaskStatistics(): Observable<TeamTaskStatistics> {
    return this.get<TeamTaskStatistics>('/api/equipes/my-team');
  }

  getMemberTaskCounts(memberId: string): Observable<MemberTaskCounts> {
    return this.get<MemberTaskCounts>(`/api/taches/manager/member/${memberId}/counts`);
  }

  getTeamPerformanceMetrics(): Observable<TeamPerformanceMetrics> {
    return this.get<TeamPerformanceMetrics>('/api/equipes/my-team/performance');
  }

  // Real-time team monitoring
  getTeamMemberStatus(teamId: string): Observable<TeamMemberStatus[]> {
    return this.get<TeamMemberStatus[]>(`/api/equipes/${teamId}/member-status`);
  }

  updateMemberStatus(memberId: string, status: 'online' | 'offline' | 'away'): Observable<void> {
    return this.patch<void>(`/api/utilisateurs/${memberId}/status`, { status });
  }

  // Team activity monitoring
  getTeamActivityFeed(teamId: string, limit: number = 10): Observable<TeamActivity[]> {
    return this.get<TeamActivity[]>(`/api/equipes/${teamId}/activity?limit=${limit}`);
  }

  // Member productivity tracking
  getMemberProductivityMetrics(memberId: string, period: string = '7days'): Observable<MemberProductivityMetrics> {
    return this.get<MemberProductivityMetrics>(`/api/utilisateurs/${memberId}/productivity?period=${period}`);
  }

  // Team health and insights
  getTeamHealthMetrics(teamId: string): Observable<TeamHealthMetrics> {
    return this.get<TeamHealthMetrics>(`/api/equipes/${teamId}/health`);
  }
}

export interface TeamTaskStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface MemberTaskCounts {
  memberId: string;
  memberName: string;
  currentTasks: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface TeamPerformanceMetrics {
  averageCompletionTime: number;
  averageWorkload: number;
  productivityScore: number;
  teamEfficiency: number;
}

// Additional interfaces for real-time monitoring and analytics
export interface TeamMemberStatus {
  memberId: string;
  memberName: string;
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  currentLocation?: string;
}

export interface TeamActivity {
  id: string;
  type: 'task_completed' | 'task_assigned' | 'member_joined' | 'status_changed';
  description: string;
  actorName: string;
  targetName?: string;
  timestamp: string;
  metadata?: any;
}

export interface MemberProductivityMetrics {
  memberId: string;
  memberName: string;
  tasksCompletedOnTime: number;
  averageTaskCompletionTime: number;
  productivityScore: number;
  weeklyTrend: number;
  strengths: string[];
  improvementAreas: string[];
}

export interface TeamHealthMetrics {
  teamId: string;
  overallHealthScore: number;
  workloadBalance: number;
  communicationFrequency: number;
  collaborationScore: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}
