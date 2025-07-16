import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { CandidatureDto, StatutCandidature } from '../models/candidature.model';
import { AuthService } from '../../auth/services/auth.service';
import { ProfileService } from './profile.service';

export interface CreateCandidatureRequest {
  dateCandidature: string; // Format: YYYY-MM-DD
  statut: StatutCandidature;
  candidatId: string;
  offreId: string;
  profilId: string;
}

export interface CandidatureResponse {
  success: boolean;
  message: string;
  candidature?: CandidatureDto;
}

export interface CompatibilityAnalysisRequest {
  candidate_id: string;
  job_offer_id: string;
}

export interface CompatibilityAnalysisResponse {
  compatibility_score?: number;
  analysis?: any;
  // Add other fields based on the actual API response
}

@Injectable({
  providedIn: 'root'
})
export class CandidatureService extends BaseHttpService {

  constructor(
    protected override http: HttpClient,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    super(http);
  }

  /**
   * Get current user's ID from auth service
   */
  private getCurrentUserId(): string | null {
    const user = this.authService.getUserData();
    return user?.id || null;
  }

  /**
   * Apply for a job offer
   */
  applyForJob(jobOfferId: string): Observable<CandidatureResponse> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Create candidature data
    const candidatureData: CreateCandidatureRequest = {
      dateCandidature: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      statut: StatutCandidature.EN_ATTENTE,
      candidatId: userId,
      offreId: jobOfferId,
      profilId: userId // Assuming profile ID is same as user ID
    };

    console.log('Applying for job:', jobOfferId, 'User:', userId, candidatureData);

    // Trigger compatibility analysis (fire and forget)
    this.analyzeCompatibility(userId, jobOfferId).subscribe({
      next: (result) => console.log('Compatibility analysis completed:', result),
      error: (error) => console.error('Compatibility analysis failed:', error)
    });

    return this.post<CandidatureResponse>('/api/candidatures', candidatureData);
  }

  /**
   * Analyze compatibility between candidate and job offer
   */
  private analyzeCompatibility(candidateId: string, jobOfferId: string): Observable<CompatibilityAnalysisResponse> {
    const compatibilityData: CompatibilityAnalysisRequest = {
      candidate_id: candidateId,
      job_offer_id: jobOfferId
    };

    console.log('Analyzing compatibility:', compatibilityData);
    
    return this.http.post<CompatibilityAnalysisResponse>('http://localhost:8000/analyze-compatibility', compatibilityData);
  }

  /**
   * Get all candidatures for the current user
   */
  getMyCandidatures(): Observable<CandidatureDto[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('Getting candidatures for user:', userId);
    return this.get<any>(`/api/candidatures/candidat/${userId}`)
      .pipe(
        map(response => {
          // Handle different response formats
          if (Array.isArray(response)) {
            return response;
          } else if (response && response.content && Array.isArray(response.content)) {
            return response.content;
          } else if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.warn('Invalid candidatures response format:', response);
            return [];
          }
        }),
        catchError((error: any) => {
          console.error('Error fetching candidatures:', error);
          return of([]);
        })
      );
  }

  /**
   * Get all candidatures (admin only)
   */
  getAllCandidatures(): Observable<CandidatureDto[]> {
    return this.get<CandidatureDto[]>('/api/candidatures');
  }

  /**
   * Get candidature by ID
   */
  getCandidatureById(candidatureId: string): Observable<CandidatureDto> {
    return this.get<CandidatureDto>(`/api/candidatures/${candidatureId}`);
  }

  /**
   * Delete candidature by ID
   */
  deleteCandidature(candidatureId: string): Observable<CandidatureResponse> {
    return this.delete<CandidatureResponse>(`/api/candidatures/${candidatureId}`);
  }

  /**
   * Check if user has already applied for a specific job
   */
  hasAppliedForJob(jobOfferId: string): Observable<boolean> {
    return new Observable(observer => {
      this.getMyCandidatures().subscribe({
        next: (candidatures) => {
          const hasApplied = candidatures.some(candidature => candidature.offreId === jobOfferId);
          observer.next(hasApplied);
          observer.complete();
        },
        error: (error) => {
          console.error('Error checking if user has applied:', error);
          observer.next(false); // Default to false on error
          observer.complete();
        }
      });
    });
  }
}
