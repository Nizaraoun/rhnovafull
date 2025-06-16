import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DashboardStats, PendingTask } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';
  
  // Observable for real-time dashboard updates
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();
  
  private pendingTasksSubject = new BehaviorSubject<PendingTask[]>([]);
  public pendingTasks$ = this.pendingTasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics from backend
   */
  getDashboardStats(): Observable<DashboardStats> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Add authorization header if needed
      // 'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { headers })
      .pipe(
        tap(stats => {
          this.dashboardStatsSubject.next(stats);
          console.log('Dashboard stats loaded:', stats);
        }),
        catchError(this.handleError<DashboardStats>('getDashboardStats'))
      );
  }

  /**
   * Get pending tasks from backend
   */
  getPendingTasks(): Observable<PendingTask[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Add authorization header if needed
      // 'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<PendingTask[]>(`${this.apiUrl}/pending-tasks`, { headers })
      .pipe(
        tap(tasks => {
          this.pendingTasksSubject.next(tasks);
          console.log('Pending tasks loaded:', tasks);
        }),
        catchError(this.handleError<PendingTask[]>('getPendingTasks', []))
      );
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.getDashboardStats().subscribe();
    this.getPendingTasks().subscribe();
  }

  /**
   * Get current dashboard stats value
   */
  getCurrentStats(): DashboardStats | null {
    return this.dashboardStatsSubject.value;
  }

  /**
   * Get current pending tasks value
   */
  getCurrentPendingTasks(): PendingTask[] {
    return this.pendingTasksSubject.value;
  }

  /**
   * Error handler
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Let the app keep running by returning an empty result.
      return new Observable<T>(observer => {
        observer.next(result as T);
        observer.complete();
      });
    };
  }

  /**
   * Get authentication token (implement based on your auth system)
   */
  private getToken(): string | null {
    // Implement your token retrieval logic here
    return localStorage.getItem('authToken');
  }
}
