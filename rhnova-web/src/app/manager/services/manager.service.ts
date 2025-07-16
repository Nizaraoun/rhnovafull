import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../shared/services/base-http.service';

export interface ManagerTask {
  membreId: string;
  membreName: string;
  id: string;
  titre: string;
  description: string;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE';
  dateDebut: string;
  dateFin: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  assigneeId?: string;
  assigneeName?: string;
  progression: number;
  evaluation?: number;
  createdById: string;
  createdByName: string;
  dateCreation: string;
  lastUpdated: string;
  projetId: string; // Now required since tasks are always part of a project
  projetName?: string;
}

export interface CreateTaskRequest {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE';
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  assigneeId: string; // Make this required instead of optional
  membreId?: string; // Keep this as optional for backward compatibility
}

export interface Project {
  id: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  budget: number;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'ANNULE';
  progression: number;
  managerId: string;
  managerName: string;
  equipeId?: string;
  equipeName?: string;
  dateCreation: string;
  lastUpdated: string;
  tasks?: ManagerTask[];
}

export interface CreateProjectRequest {
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  budget: number;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'ANNULE';
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
  }  // Project management methods
  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.post<Project>('/api/projets/manager/create', project);
  }

  updateProject(projectId: string, updates: Partial<CreateProjectRequest>): Observable<Project> {
    return this.put<Project>(`/api/projets/manager/${projectId}`, updates);
  }

  deleteProject(projectId: string): Observable<void> {
    return this.delete<void>(`/api/projets/manager/${projectId}`);
  }

  getMyProjects(): Observable<Project[]> {
    return this.get<Project[]>('/api/projets/manager/my-projects');
  }

  assignProjectToTeam(projectId: string, teamId: string): Observable<void> {
    return this.patch<void>(`/api/projets/manager/${projectId}/assign-team/${teamId}`, {});
  }

  updateProjectProgression(projectId: string): Observable<Project> {
    return this.patch<Project>(`/api/projets/${projectId}/update-progression`, {});
  }

  // Task management methods within projects
  createTaskInProject(projectId: string, task: CreateTaskRequest): Observable<ManagerTask> {
    console.log('Creating task in project+++++++++++++++++++++:', projectId, task);
    return this.post<ManagerTask>(`/api/projets/manager/${projectId}/tasks/create`, task);
  }

  getProjectTasks(projectId: string): Observable<ManagerTask[]> {
    return this.get<ManagerTask[]>(`/api/projets/${projectId}/tasks`);
  }

  // Team-related methods
  getMyTeamDetails(): Observable<DetailedTeam> {
    return this.get<DetailedTeam>('/api/equipes/manager-details');
  }

  // Alternative method that uses the working endpoint
  getMyTeam(): Observable<DetailedTeam> {
    return this.get<DetailedTeam>('/api/equipes/my-team');
  }

  // Legacy task management methods (might be deprecated)
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

  // Assign task to team member (legacy method, might be replaced by createTaskInProject)
  assignTask(taskId: string, memberId: string): Observable<void> {
    return this.post<void>(`/api/taches/manager/assign/${taskId}/${memberId}`, {});
  }

  // Create standalone task (legacy method, might be deprecated)
  createTask(task: CreateTaskRequest): Observable<ManagerTask> {
    return this.post<ManagerTask>('/api/taches/manager/create', task);
  }

  // Project statistics and member performance
  getProjectStatistics(): Observable<ProjectStatistics> {
    return this.get<ProjectStatistics>('/api/projets/manager/statistics');
  }

  getTeamProjectStatistics(): Observable<TeamProjectStatistics> {
    return this.get<TeamProjectStatistics>('/api/projets/manager/team-statistics');
  }

  getMemberProjectCounts(memberId: string): Observable<MemberProjectCounts> {
    return this.get<MemberProjectCounts>(`/api/projets/manager/member/${memberId}/counts`);
  }

  getProjectPerformanceMetrics(projectId: string): Observable<ProjectPerformanceMetrics> {
    return this.get<ProjectPerformanceMetrics>(`/api/projets/${projectId}/performance`);
  }

  // Team statistics and member performance (legacy methods)
  getTeamTaskStatistics(): Observable<TeamTaskStatistics> {
    return this.get<TeamTaskStatistics>('/api/equipes/my-team');
  }

  getMemberTaskCounts(memberId: string): Observable<MemberTaskCounts> {
    return this.get<MemberTaskCounts>(`/api/taches/manager/member/${memberId}/counts`);
  }

  getTeamPerformanceMetrics(): Observable<TeamPerformanceMetrics> {
    return this.get<TeamPerformanceMetrics>('/api/equipes/my-team/performance');
  }

  // Team member project methods
  getMyTeamProjects(): Observable<Project[]> {
    return this.get<Project[]>('/api/projets/member/my-team-projects');
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

export interface ProjectStatistics {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  pendingProjects: number;
  cancelledProjects: number;
  totalBudget: number;
  usedBudget: number;
  averageProjectDuration: number;
}

export interface TeamProjectStatistics {
  teamId: string;
  teamName: string;
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  pendingProjects: number;
  totalTasks: number;
  completedTasks: number;
  teamEfficiency: number;
  averageProjectCompletion: number;
}

export interface MemberProjectCounts {
  memberId: string;
  memberName: string;
  assignedProjects: number;
  completedProjects: number;
  currentTasks: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  averageTasksPerProject: number;
}

export interface ProjectPerformanceMetrics {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  averageTaskCompletionTime: number;
  projectEfficiency: number;
  budgetUtilization: number;
  timelineAdherence: number;
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
