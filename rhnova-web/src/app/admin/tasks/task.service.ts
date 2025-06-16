import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id?: string;
  titre: string;
  description: string;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
  dateDebut: string;
  dateFin: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  membreId: string;
  progression: number;
  evaluation: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/taches';

  constructor(private http: HttpClient) {}

  // Get all tasks
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // Get task by ID
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // Get tasks by member
  getTasksByMember(memberId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/membre/${memberId}`);
  }

  // Get tasks by team
  getTasksByTeam(teamId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/equipe/${teamId}`);
  }

  // Filter tasks by status and priority
  filterTasks(statut?: string, priorite?: string): Observable<Task[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (priorite) params = params.set('priorite', priorite);
    
    return this.http.get<Task[]>(`${this.apiUrl}/filter`, { params });
  }

  // Create new task
  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  // Update task
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  // Delete task
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Update task status
  updateTaskStatus(id: string, statut: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/statut`, null, {
      params: { statut }
    });
  }

  // Update task progression
  updateTaskProgression(id: string, progression: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/progression`, null, {
      params: { progression: progression.toString() }
    });
  }

  // Update task evaluation
  updateTaskEvaluation(id: string, evaluation: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/evaluation`, null, {
      params: { evaluation: evaluation.toString() }
    });
  }
}
