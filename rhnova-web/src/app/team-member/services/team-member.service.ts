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
  membreId: string;
  membreName: string;
  progression: number;
  evaluation?: number;
  createdById: string;
  createdByName: string;
  dateCreation: string;
  lastUpdated: string;
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
  // Team-related methods
  getMyTeamDetails(): Observable<DetailedTeam> {
    return this.get<DetailedTeam>('/api/equipes/my-team');
  }

  getMyTeamManager(): Observable<TeamMember> {
    return this.get<TeamMember>('/api/equipes/my-team/manager');
  }

  // Task-related methods for team members
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
}
