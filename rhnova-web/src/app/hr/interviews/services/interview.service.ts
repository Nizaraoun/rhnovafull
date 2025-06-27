import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../shared/services/base-http.service';
import { StatutEntretien } from '../../../shared/models/interview.model';

export interface InterviewResponse {
  id: string;
  candidatureId: string;
  candidatId: string;
  candidatNom: string;
  candidatEmail: string;
  offreId: string;
  titreOffre: string;
  dateEntretien: string;
  heureEntretien: string;
  dureeMinutes: number;
  type: 'TECHNIQUE' | 'RH' | 'COMPORTEMENTAL' | 'DIRECTION' | 'TELEPHONIQUE';
  statut: StatutEntretien;
  lieu?: string;
  lienVisio?: string;
  objectifs?: string;
  commentaires?: string;
  note?: number;
  dateCreation: string;
  dateModification?: string;
  responsableRHId: string;
  responsableRHNom: string;
}

export interface CreateInterviewRequest {
  candidatureId: string;
  dateEntretien: string;
  heureEntretien: string;
  dureeMinutes: number;
  type: 'TECHNIQUE' | 'RH' | 'COMPORTEMENTAL' | 'DIRECTION' | 'TELEPHONIQUE';
  statut: StatutEntretien;
  lieu?: string;
  lienVisio?: string;
  objectifs?: string;
  commentaires?: string;
}

export interface UpdateInterviewRequest {
  candidatureId: string;
  dateEntretien: string;
  heureEntretien: string;
  dureeMinutes: number;
  type: 'TECHNIQUE' | 'RH' | 'COMPORTEMENTAL' | 'DIRECTION' | 'TELEPHONIQUE';
  statut: StatutEntretien;
  lieu?: string;
  lienVisio?: string;
  objectifs?: string;
  commentaires?: string;
}

export interface AvailableCandidate {
  candidatureId: string;
  candidatId: string;
  nom: string;
  prenom: string;
  email: string;
  nomComplet: string;
  titreOffre: string;
  offreId: string;
}

export interface StatusUpdateRequest {
  statut: StatutEntretien;
}

export interface NoteUpdateRequest {
  note?: number;
  commentaires?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService extends BaseHttpService {

  /**
   * Get all interviews
   */
  getAllInterviews(): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>('/api/entretiens');
  }

  /**
   * Get interview by ID
   */
  getInterviewById(id: string): Observable<InterviewResponse> {
    return this.get<InterviewResponse>(`/api/entretiens/${id}`);
  }

  /**
   * Create new interview
   */
  createInterview(interview: CreateInterviewRequest): Observable<InterviewResponse> {
    return this.post<InterviewResponse>('/api/entretiens', interview);
  }

  /**
   * Update interview
   */
  updateInterview(id: string, interview: UpdateInterviewRequest): Observable<InterviewResponse> {
    return this.put<InterviewResponse>(`/api/entretiens/${id}`, interview);
  }

  /**
   * Delete interview
   */
  deleteInterview(id: string): Observable<void> {
    return this.delete<void>(`/api/entretiens/${id}`);
  }

  /**
   * Get interviews by date
   */
  getInterviewsByDate(date: string): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>(`/api/entretiens/date/${date}`);
  }

  /**
   * Get interviews by date range
   */
  getInterviewsByDateRange(startDate: string, endDate: string): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>(`/api/entretiens/date-range`, { startDate, endDate });
  }

  /**
   * Get interviews by status
   */
  getInterviewsByStatus(status: string): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>(`/api/entretiens/statut/${status}`);
  }

  /**
   * Get interviews by type
   */
  getInterviewsByType(type: string): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>(`/api/entretiens/type/${type}`);
  }

  /**
   * Get interviews by candidature
   */
  getInterviewsByCandidature(candidatureId: string): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>(`/api/entretiens/candidature/${candidatureId}`);
  }

  /**
   * Get interviews by HR responsible
   */
  getInterviewsByHRResponsible(responsableRHId: string): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>(`/api/entretiens/responsable/${responsableRHId}`);
  }

  /**
   * Get available candidates for interviews
   */
  getAvailableCandidates(): Observable<AvailableCandidate[]> {
    return this.get<AvailableCandidate[]>('/api/entretiens/candidates/available');
  }

  /**
   * Update interview status
   */
  updateInterviewStatus(id: string, status: StatusUpdateRequest): Observable<InterviewResponse> {
    return this.patch<InterviewResponse>(`/api/entretiens/${id}/statut`, status);
  }

  /**
   * Add note and comments to interview
   */
  updateInterviewNote(id: string, noteData: NoteUpdateRequest): Observable<InterviewResponse> {
    return this.patch<InterviewResponse>(`/api/entretiens/${id}/note`, noteData);
  }

  /**
   * Flexible filter (backward compatibility)
   */
  filterInterviews(filters: {
    date?: string;
    candidatureId?: string;
    responsableRHId?: string;
  }): Observable<InterviewResponse[]> {
    return this.get<InterviewResponse[]>('/api/entretiens/filter', filters);
  }

  /**
   * Map interview response to component format
   */
  mapToComponentFormat(interview: InterviewResponse): any {
    // Split dateEntretien into date and time for the form
    const dateTime = new Date(interview.dateEntretien);
    const date = dateTime.toISOString().split('T')[0];
    const time = interview.heureEntretien || dateTime.toTimeString().substr(0, 5);

    return {
      id: interview.id,
      candidatId: interview.candidatId,
      candidatNom: interview.candidatNom,
      candidatEmail: interview.candidatEmail,
      candidatureId: interview.candidatureId,
      offreId: interview.offreId,
      titreOffre: interview.titreOffre,
      dateEntretien: date,
      heureEntretien: time,
      dureeMinutes: interview.dureeMinutes,
      type: interview.type,
      statut: interview.statut,
      lieu: interview.lieu,
      lienVisio: interview.lienVisio,
      objectifs: interview.objectifs,
      commentaires: interview.commentaires,
      note: interview.note,
      responsableRHId: interview.responsableRHId,
      responsableRHNom: interview.responsableRHNom,
      // Original datetime for display
      originalDateTime: interview.dateEntretien
    };
  }

  /**
   * Map component form data to API format
   */
  mapToApiFormat(formData: any): CreateInterviewRequest | UpdateInterviewRequest {
    return {
      candidatureId: formData.candidatureId,
      dateEntretien: formData.dateEntretien,
      heureEntretien: formData.heureEntretien,
      dureeMinutes: formData.dureeMinutes,
      type: formData.type,
      statut: formData.statut,
      lieu: formData.lieu,
      lienVisio: formData.lienVisio,
      objectifs: formData.objectifs,
      commentaires: formData.commentaires
    };
  }
}
