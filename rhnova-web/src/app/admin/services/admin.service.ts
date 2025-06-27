import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseHttpService } from '../../shared/services/base-http.service';
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

// Team request interface for API calls
export interface TeamRequest {
  nom: string;
  description: string;
  managerId: string;
  membreIds: string[];
}

// Team interface matching backend entity
export interface Team {
  id: string;
  nom: string;
  description: string;
  manager: UserDto;
  membres: UserDto[];
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
export class AdminService extends BaseHttpService {

  constructor(http: HttpClient) {
    super(http);
  }
  // User management
  getAllUsers(): Observable<UserDto[]> {
    return this.get<UserDto[]>('/api/admin/users');
  }

  getUserById(id: string): Observable<UserDto> {
    return this.get<UserDto>(`/api/admin/users/${id}`);
  }

  createUser(user: UserDto): Observable<UserDto> {
    return this.post<UserDto>('/api/admin/users', user);
  }
  // For creating internal users (not external candidates)
  createInternalUser(user: { name: string, email: string, password: string, role: Role }): Observable<UserDto> {
    return this.post<UserDto>('/api/auth/create-internal-user', user);
  }

  updateUser(id: string, user: UserDto): Observable<UserDto> {
    return this.put<UserDto>(`/api/admin/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.delete<void>(`/api/admin/users/${id}`);
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
    return this.get<EquipeDto[]>('/api/equipes');
  }

  // Team management (using EquipeDto but with Team interface for UI)
  getAllTeams(): Observable<Team[]> {
    return this.get<Team[]>('/api/equipes');
  }  createTeam(team: TeamRequest): Observable<Team> {
    // Ensure the request matches exactly the curl example:
    // { "nom": "...", "description": "...", "managerId": "...", "membreIds": [...] }
    const requestPayload = {
      nom: team.nom,
      description: team.description,
      managerId: team.managerId,
      membreIds: team.membreIds
    };
    
    console.log('Creating team with payload:', requestPayload);
    return this.post<Team>('/api/equipes', requestPayload);
  }
  updateTeam(id: string, team: TeamRequest): Observable<Team> {
    // Ensure the request matches exactly the curl example:
    // { "nom": "...", "description": "...", "managerId": "...", "membreIds": [...] }
    const requestPayload = {
      nom: team.nom,
      description: team.description,
      managerId: team.managerId,
      membreIds: team.membreIds
    };
    
    console.log('Updating team with payload:', requestPayload);
    return this.put<Team>(`/api/equipes/${id}`, requestPayload);
  }
  deleteTeam(id: string): Observable<void> {
    return this.delete<void>(`/api/equipes/${id}`);
  }

  // Team member management
  addMemberToTeam(teamId: string, memberId: string): Observable<void> {
    return this.post<void>(`/api/equipes/${teamId}/membres/${memberId}`, {});
  }

  removeMemberFromTeam(teamId: string, memberId: string): Observable<void> {
    return this.delete<void>(`/api/equipes/${teamId}/membres/${memberId}`);
  }

  getTeamMembers(teamId: string): Observable<UserDto[]> {
    return this.get<UserDto[]>(`/api/equipes/${teamId}/membres`);
  }  // Candidature management
  getAllCandidatures(): Observable<CandidatureDto[]> {
    return this.get<CandidatureDto[]>('/api/admin/candidatures');
  }

  createCandidature(candidature: CandidatureDto): Observable<CandidatureDto> {
    return this.post<CandidatureDto>('/api/admin/candidatures', candidature);
  }

  updateCandidature(id: string, candidature: CandidatureDto): Observable<CandidatureDto> {
    return this.put<CandidatureDto>(`/api/admin/candidatures/${id}`, candidature);
  }

  deleteCandidature(id: string): Observable<void> {
    return this.delete<void>(`/api/admin/candidatures/${id}`);
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
    }    return this.get<any>('/api/joboffers/all', params)
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
    return this.get<JobOfferBackend>(`/api/joboffers/${id}`)
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
    
    return this.post<JobOfferBackend>('/api/joboffers/create', backendOffer)
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
    
    return this.put<JobOfferBackend>(`/api/joboffers/update/${id}`, backendOffer)
      .pipe(
        map(response => JobOfferMapper.backendToDisplay(response)),
        catchError((error: any) => {
          console.error('Error updating job offer:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }

  deleteJobOffer(id: string): Observable<void> {
    return this.delete<void>(`/api/joboffers/delete/${id}`)
      .pipe(
        catchError((error: any) => {
          console.error('Error deleting job offer:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }

  archiveJobOffer(id: string): Observable<void> {
    return this.patch<void>(`/api/joboffers/archive/${id}`, {})
      .pipe(
        catchError((error: any) => {
          console.error('Error archiving job offer:', error);
          throw error; // Re-throw for component to handle
        })
      );
  }
}
