import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../shared/services/base-http.service';

export interface TeamMemberTask {
  id: string;
  titre: string;
  description: string;
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE';
  dateDebut: string;
  dateFin: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  assigneeId: string;
  assigneeName: string;
  progression: number;
  evaluation?: number;
  createdById: string;
  createdByName: string;
  dateCreation: string;
  lastUpdated: string;
  projetId: string; // Now required since tasks are always part of a project
  projetName?: string;
}

export interface TeamMemberProject {
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
  equipeId: string;
  equipeName: string;
  dateCreation: string;
  lastUpdated: string;
  myTasks?: TeamMemberTask[];
  totalTasks?: number;
  completedTasks?: number;
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

export interface TaskProgressUpdate {
  progression: number;
}

export interface TaskStatusUpdate {
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
}

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService extends BaseHttpService {

  constructor(http: HttpClient) {
    super(http);
  }
  // Project-related methods for team members
  getMyTeamProjects(): Observable<TeamMemberProject[]> {
    return this.get<TeamMemberProject[]>('/api/projets/member/my-team-projects');
  }

  getProjectTasks(projectId: string): Observable<TeamMemberTask[]> {
    return this.get<TeamMemberTask[]>(`/api/projets/${projectId}/tasks`);
  }

  // Team-related methods
  getMyTeamDetails(): Observable<DetailedTeam> {
    return this.get<DetailedTeam>('/api/equipes/my-team');
  }

  getMyTeamManager(): Observable<TeamMember> {
    return this.get<TeamMember>('/api/equipes/my-team/manager');
  }

  // Task-related methods for team members (now project-based)
  getMyTasks(): Observable<TeamMemberTask[]> {
    return this.get<TeamMemberTask[]>('/api/taches/member/my-tasks');
  }

  getTeamTasks(): Observable<TeamMemberTask[]> {
    return this.get<TeamMemberTask[]>('/api/taches/member/team-tasks');
  }

  updateTaskProgress(taskId: string, progression: number): Observable<TeamMemberTask> {
    return this.patch<TeamMemberTask>(
      `/api/taches/member/${taskId}/progress?progression=${progression}`,
      {}
    );
  }

  updateTaskStatus(taskId: string, status: string): Observable<TeamMemberTask> {
    return this.patch<TeamMemberTask>(
      `/api/taches/member/${taskId}/status?status=${status}`,
      {}
    );
  }

  getTaskDetails(taskId: string): Observable<TeamMemberTask> {
    return this.get<TeamMemberTask>(`/api/taches/details/${taskId}`);
  }

  // New project-based task methods
  getTasksForProject(projetId: string): Observable<TeamMemberTask[]> {
    return this.get<TeamMemberTask[]>(`/api/projets/${projetId}/tasks`);
  }

  // Update task progress within project context
  updateProjectTaskProgress(taskId: string, progression: number): Observable<TeamMemberTask> {
    return this.patch<TeamMemberTask>(
      `/api/taches/member/${taskId}/progress?progression=${progression}`,
      {}
    );
  }

  // Update task status within project context
  updateProjectTaskStatus(taskId: string, status: string): Observable<TeamMemberTask> {
    return this.patch<TeamMemberTask>(
      `/api/taches/member/${taskId}/status?status=${status}`,
      {}
    );
  }
}
