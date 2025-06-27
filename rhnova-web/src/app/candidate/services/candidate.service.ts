import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  JobOfferBackend, 
  JobOfferDisplay, 
  JobOfferFilters, 
  JobOfferMapper 
} from '../../shared/models/jobOfferBackend';
import { CandidatureService } from '../../shared/services/candidature.service';
import { CandidatureDashboardDisplay, mapStatutToDisplayStatus } from '../../shared/models/candidature.model';
import { InterviewDto } from '../../shared/models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private candidatureService: CandidatureService
  ) {}

  // Get all available job offers for candidates
  getAllJobOffers(filters?: JobOfferFilters): Observable<JobOfferDisplay[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.titre) params = params.set('titre', filters.titre);
      if (filters.localisation) params = params.set('localisation', filters.localisation);
      if (filters.typedemploi) params = params.set('typedemploi', filters.typedemploi);
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.size !== undefined) params = params.set('size', filters.size.toString());
      if (filters.sort) params = params.set('sort', filters.sort);
    }

    return this.http.get<any>(`${this.apiUrl}/api/joboffers/all`, { params })
      .pipe(
        map(response => {
          console.log('Raw API response:', response);
          
          // Handle different response formats
          let backendOffers: JobOfferBackend[] = [];
          
          if (Array.isArray(response)) {
            // Direct array response
            backendOffers = response;
          } else if (response && response.content && Array.isArray(response.content)) {
            // Paginated response with content property
            backendOffers = response.content;
          } else if (response && response.data && Array.isArray(response.data)) {
            // Response with data property
            backendOffers = response.data;
          } else if (response && typeof response === 'object') {
            // Single object response, wrap in array
            backendOffers = [response];
          } else {
            // No data or invalid format
            console.warn('Invalid response format:', response);
            backendOffers = [];
          }
          
          return backendOffers.map(offer => JobOfferMapper.backendToDisplay(offer));
        }),
        catchError((error: any) => {
          console.error('API Error:', error);
          // Return empty array on error
          return of([]);
        })
      );
  }

  // Get specific job offer by ID
  getJobOfferById(id: string): Observable<JobOfferDisplay> {
    return this.http.get<JobOfferBackend>(`${this.apiUrl}/api/joboffers/${id}`)
      .pipe(
        map(backendOffer => JobOfferMapper.backendToDisplay(backendOffer)),
        catchError((error: any) => {
          console.error('Error fetching job offer by ID:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }
  // Apply for a job offer
  applyForJob(jobOfferId: string): Observable<any> {
    return this.candidatureService.applyForJob(jobOfferId);
  }

  // Get candidate's applications
  getCandidateApplications(): Observable<any[]> {
    return this.candidatureService.getMyCandidatures();
  }

  // Get candidate's applications with job offer details for dashboard display
  getCandidateApplicationsWithJobDetails(): Observable<CandidatureDashboardDisplay[]> {
    return this.candidatureService.getMyCandidatures().pipe(
      switchMap(candidatures => {
        if (candidatures.length === 0) {
          return of([]);
        }

        // Create an array of observables to fetch job details for each candidature
        const jobDetailRequests = candidatures.map(candidature => 
          this.getJobOfferById(candidature.offreId).pipe(
            map(jobOffer => ({
              id: candidature.id,
              jobTitle: jobOffer.title,
              company: jobOffer.department || 'Unknown Company',
              appliedDate: typeof candidature.dateCandidature === 'string' 
                ? new Date(candidature.dateCandidature) 
                : candidature.dateCandidature,
              status: mapStatutToDisplayStatus(candidature.statut),
              jobOfferId: candidature.offreId,
              originalStatus: candidature.statut
            } as CandidatureDashboardDisplay)),
            catchError(error => {
              console.error(`Error fetching job offer ${candidature.offreId}:`, error);
              // Return a fallback object if job offer fetch fails
              return of({
                id: candidature.id,
                jobTitle: 'Position Unavailable',
                company: 'Unknown Company',
                appliedDate: typeof candidature.dateCandidature === 'string' 
                  ? new Date(candidature.dateCandidature) 
                  : candidature.dateCandidature,
                status: mapStatutToDisplayStatus(candidature.statut),
                jobOfferId: candidature.offreId,
                originalStatus: candidature.statut
              } as CandidatureDashboardDisplay);
            })
          )
        );

        // Execute all requests in parallel
        return forkJoin(jobDetailRequests);
      }),
      catchError(error => {
        console.error('Error loading candidatures:', error);
        return of([]);
      })
    );
  }

  // Check if user has already applied for a job
  hasAppliedForJob(jobOfferId: string): Observable<boolean> {
    return this.candidatureService.hasAppliedForJob(jobOfferId);
  }

  // Search job offers with filters
  searchJobOffers(searchTerm: string, type?: string, location?: string): Observable<JobOfferDisplay[]> {
    const filters: JobOfferFilters = {};
    
    if (searchTerm.trim()) {
      filters.titre = searchTerm;
    }
    
    if (type) {
      // Map frontend types to backend enum
      switch (type) {
        case 'full-time':
          filters.typedemploi = 'FULL_TIME';
          break;
        case 'part-time':
          filters.typedemploi = 'PART_TIME';
          break;
        case 'INTERNSHIP':
          filters.typedemploi = 'INTERNSHIP';
          break;
      }
    }
    
    if (location?.trim()) {
      filters.localisation = location;
    }
    
    return this.getAllJobOffers(filters);
  }
  // Get recent job offers for dashboard
  getRecentJobOffers(limit: number = 5): Observable<JobOfferDisplay[]> {
    const filters: JobOfferFilters = {
      size: limit,
      sort: 'datePublication,desc'
    };
    
    return this.getAllJobOffers(filters);
  }

  // Get interviews for a candidature
  getInterviewsByCandidature(candidatureId: string): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.apiUrl}/api/entretiens/candidature/${candidatureId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching interviews for candidature:', error);
          return of([]);
        })
      );
  }

  // Get candidate's upcoming interviews
  getMyUpcomingInterviews(): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.apiUrl}/api/entretiens/my-interviews`)
      .pipe(
        catchError(error => {
          console.error('Error fetching my interviews:', error);
          return of([]);
        })
      );
  }
}
