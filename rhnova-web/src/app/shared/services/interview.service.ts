import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  InterviewDto, 
  StatutEntretien, 
  mapStatutEntretienToLabel,
  mapStatutEntretienToClass 
} from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get interviews for a specific candidature
   */
  getInterviewsByCandidature(candidatureId: string): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.apiUrl}/api/entretiens/candidature/${candidatureId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching interviews for candidature:', error);
          return of([]);
        })
      );
  }

  /**
   * Get candidate's interviews (for candidate view)
   */
  getMyInterviews(): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.apiUrl}/api/entretiens/my-interviews`)
      .pipe(
        catchError(error => {
          console.error('Error fetching my interviews:', error);
          return of([]);
        })
      );
  }

  /**
   * Get upcoming interviews for current candidate
   */
  getMyUpcomingInterviews(): Observable<InterviewDto[]> {
    return this.getMyInterviews().pipe(
      map(interviews => interviews.filter(interview => {
        const interviewDate = new Date(interview.dateEntretien);
        const now = new Date();
        return interviewDate >= now && (
          interview.statut === StatutEntretien.PLANIFIE ||
          interview.statut === StatutEntretien.CONFIRME
        );
      }))
    );
  }

  /**
   * Get interview by ID
   */
  getInterviewById(id: string): Observable<InterviewDto | null> {
    return this.http.get<InterviewDto>(`${this.apiUrl}/api/entretiens/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching interview:', error);
          return of(null);
        })
      );
  }

  /**
   * Helper method to get status label
   */
  getStatusLabel(status: StatutEntretien): string {
    return mapStatutEntretienToLabel(status);
  }

  /**
   * Helper method to get status CSS class
   */
  getStatusClass(status: StatutEntretien): string {
    return mapStatutEntretienToClass(status);
  }

  /**
   * Check if interview is upcoming
   */
  isUpcoming(interview: InterviewDto): boolean {
    const interviewDate = new Date(interview.dateEntretien);
    const now = new Date();
    return interviewDate >= now && (
      interview.statut === StatutEntretien.PLANIFIE ||
      interview.statut === StatutEntretien.CONFIRME
    );
  }

  /**
   * Check if interview is in progress
   */
  isInProgress(interview: InterviewDto): boolean {
    return interview.statut === StatutEntretien.EN_COURS;
  }

  /**
   * Check if interview is completed
   */
  isCompleted(interview: InterviewDto): boolean {
    return interview.statut === StatutEntretien.TERMINE;
  }

  /**
   * Format interview date and time for display
   */
  formatInterviewDateTime(interview: InterviewDto): string {
    const date = new Date(interview.dateEntretien);
    const dateStr = date.toLocaleDateString('fr-FR');
    const timeStr = interview.heureDebut || date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${dateStr} at ${timeStr}`;
  }

  /**
   * Get time until interview
   */
  getTimeUntilInterview(interview: InterviewDto): string {
    const interviewDate = new Date(interview.dateEntretien);
    const now = new Date();
    const diffInMs = interviewDate.getTime() - now.getTime();
    
    if (diffInMs < 0) return 'Past';
    
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
  }
}
