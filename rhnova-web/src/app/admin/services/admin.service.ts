import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  AuthResponse, 
  LoginRequest, 
  UserDto, 
  User, 
  Role, 
  CandidatureDto, 
  StatutCandidature     
} from '../../shared/models';
import { EquipeDto } from '../../shared/models/equipe.model';
import { 
  JobOfferBackend, 
  JobOfferDisplay, 
  JobOfferFilters, 
  JobOfferMapper 
} from '../../shared/models/jobOfferBackend';

// Additional interfaces needed by the admin module
export interface Team extends EquipeDto {
  // Additional UI properties can be added here
  memberCount?: number;
  departement?: string;
  budget?: number;
  objectifs?: string;
  membres?: UserDto[]; // For displaying member information
}



export interface Candidate {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  competences?: string;
  experience?: number;
  salaireSouhaite?: number;
  statut: string;
  cvUrl?: string;
  lettreMotivationUrl?: string;
}

export interface Interview {
  id: string;
  candidatId: string;
  intervieweurId: string;
  dateEntretien: string;
  dureeMinutes: number;
  type: string;
  statut: string;
  lieu?: string;
  lienVisio?: string;
  objectifs?: string;
  commentaires?: string;
  note?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // User management
  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/api/admin/users`);
  }

  getUserById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/api/admin/users/${id}`);
  }

  createUser(user: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/api/admin/users`, user);
  }
  // For creating internal users (not external candidates)
  createInternalUser(user: { name: string, email: string, password: string, role: Role }): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/api/auth/create-internal-user`, user);
  }

  updateUser(id: string, user: UserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/api/admin/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/admin/users/${id}`);
  }

  // Candidate management
  getAllCandidates(): Observable<Candidate[]> {
    // Mock implementation - replace with actual API call
    return of([
      
    ]);
  }

  createCandidate(candidate: Candidate): Observable<Candidate> {
    // Mock implementation - replace with actual API call
    return of({...candidate, id: Math.floor(Math.random() * 10000).toString()});
  }

  updateCandidate(id: string, candidate: Partial<Candidate>): Observable<Candidate> {
    // Mock implementation - replace with actual API call
    return of({...candidate, id} as Candidate);
  }

  deleteCandidate(id: string): Observable<void> {
    // Mock implementation - replace with actual API call
    return of(undefined);
  }

  // Interview management
  getAllInterviews(): Observable<Interview[]> {
    // Mock implementation - replace with actual API call
    return of([
     
    ]);
  }

  createInterview(interview: Partial<Interview>): Observable<Interview> {
    // Mock implementation - replace with actual API call
    return of({...interview, id: Math.floor(Math.random() * 10000).toString()} as Interview);
  }

  updateInterview(id: string, interview: Partial<Interview>): Observable<Interview> {
    // Mock implementation - replace with actual API call
    return of({...interview, id} as Interview);
  }

  deleteInterview(id: string): Observable<void> {
    // Mock implementation - replace with actual API call
    return of(undefined);
  }  // Équipe management
  getAllEquipes(): Observable<EquipeDto[]> {
    return this.http.get<EquipeDto[]>(`${this.apiUrl}/api/equipes`);
  }

  // Team management (using EquipeDto but with Team interface for UI)
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/api/equipes`);
  }

  createTeam(team: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/api/equipes`, team);
  }

  updateTeam(id: string, team: Partial<Team>): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/api/equipes/${id}`, team);
  }
  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/equipes/${id}`);
  }

  // Team member management
  addMemberToTeam(teamId: string, memberId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/equipes/${teamId}/membres/${memberId}`, {});
  }

  removeMemberFromTeam(teamId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/equipes/${teamId}/membres/${memberId}`);
  }

  getTeamMembers(teamId: string): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/api/equipes/${teamId}/membres`);
  }
  createEquipe(equipe: EquipeDto): Observable<EquipeDto> {
    return this.http.post<EquipeDto>(`${this.apiUrl}/api/equipes`, equipe);
  }

  updateEquipe(id: string, equipe: EquipeDto): Observable<EquipeDto> {
    return this.http.put<EquipeDto>(`${this.apiUrl}/api/equipes/${id}`, equipe);
  }

  deleteEquipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/equipes/${id}`);
  }

  // Candidature management
  getAllCandidatures(): Observable<CandidatureDto[]> {
    return this.http.get<CandidatureDto[]>(`${this.apiUrl}/api/admin/candidatures`);
  }

  createCandidature(candidature: CandidatureDto): Observable<CandidatureDto> {
    return this.http.post<CandidatureDto>(`${this.apiUrl}/api/admin/candidatures`, candidature);
  }

  updateCandidature(id: string, candidature: CandidatureDto): Observable<CandidatureDto> {
    return this.http.put<CandidatureDto>(`${this.apiUrl}/api/admin/candidatures/${id}`, candidature);
  }

  deleteCandidature(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/admin/candidatures/${id}`);
  }
  // Job Offer management
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
        }),        catchError((error: any) => {
          console.error('API Error:', error);
          // Return empty array on error
          return of([]);
        })
      );
  }
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

  createJobOffer(jobOffer: JobOfferDisplay): Observable<JobOfferDisplay> {
    const backendOffer = JobOfferMapper.displayToBackend(jobOffer);
    console.log('Creating job offer with data:', backendOffer);
    
    return this.http.post<JobOfferBackend>(`${this.apiUrl}/api/joboffers/create`, backendOffer)
      .pipe(
        map(response => JobOfferMapper.backendToDisplay(response)),
        catchError((error: any) => {
          console.error('Error creating job offer:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }

  updateJobOffer(id: string, jobOffer: JobOfferDisplay): Observable<JobOfferDisplay> {
    const backendOffer = JobOfferMapper.displayToBackend(jobOffer);
    console.log('Updating job offer with data:', backendOffer);
    
    return this.http.put<JobOfferBackend>(`${this.apiUrl}/api/joboffers/update/${id}`, backendOffer)
      .pipe(
        map(response => JobOfferMapper.backendToDisplay(response)),
        catchError((error: any) => {
          console.error('Error updating job offer:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }

  deleteJobOffer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/joboffers/delete/${id}`)
      .pipe(
        catchError((error: any) => {
          console.error('Error deleting job offer:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }

  archiveJobOffer(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/api/joboffers/archive/${id}`, {})
      .pipe(
        catchError((error: any) => {
          console.error('Error archiving job offer:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }
}
