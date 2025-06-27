import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../shared/services/base-http.service';

export interface CandidatureResponse {
  id: string;
  dateCandidature: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REJETE' | 'EN_COURS';
  candidatId: string;
  offreId: string;
  profilId: string;
  candidatNom: string;
  candidatEmail: string;
  candidatRole: string;
  offreTitre: string;
  offreDescription: string;
  offreLocalisation: string;
  dateDeNaissance?: string;
  ville?: string;
  pays?: string;
  codePostal?: string;
  photo?: string;
  profession?: string;
  formations?: string[];
  experiences?: string[];
  competences?: string[];
  langues?: string[];
  certifications?: string[];
  projets?: string[];
  description?: string;
  phoneNumber?: string;
}

export interface CandidateDisplay {
    phoneNumber?: string;
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedDate: Date;
  experience: number;
  originalStatut: string;
  profileData?: {
    dateDeNaissance?: string;
    ville?: string;
    pays?: string;
    codePostal?: string;
    profession?: string;
    formations?: string[];
    experiences?: string[];
    competences?: string[];
    langues?: string[];
    certifications?: string[];
    projets?: string[];
    description?: string;
    photo?: string;
        phoneNumber?: string;

  };
}

@Injectable({
  providedIn: 'root'
})
export class CandidatureService extends BaseHttpService {

  /**
   * Get all candidatures for HR's job offers
   */
  getMyCandidatures(): Observable<CandidatureResponse[]> {
    return this.get<CandidatureResponse[]>('/api/hr/candidatures/my-job-offers');
  }

  /**
   * Update candidature status
   */
  updateCandidatureStatus(candidatureId: string, statut: string): Observable<any> {
    return this.patch(`/api/hr/candidatures/${candidatureId}/status`, { statut });
  }
  /**
   * Map API response to display format
   */
  mapToDisplayFormat(candidatures: CandidatureResponse[]): CandidateDisplay[] {
    return candidatures.map(candidature => ({
      id: candidature.id,
      name: candidature.candidatNom,
      email: candidature.candidatEmail,
      phoneNumber: candidature.phoneNumber,
      position: candidature.offreTitre,
      status: this.mapStatutToStatus(candidature.statut),
      appliedDate: new Date(candidature.dateCandidature),
      experience: this.calculateExperience(candidature.experiences || []),
      originalStatut: candidature.statut,
      profileData: {
        dateDeNaissance: candidature.dateDeNaissance,
        ville: candidature.ville,
        pays: candidature.pays,
        codePostal: candidature.codePostal,
        profession: candidature.profession,
        formations: candidature.formations,
        experiences: candidature.experiences,
        competences: candidature.competences,
        langues: candidature.langues,
        certifications: candidature.certifications,
        projets: candidature.projets,
        description: candidature.description,
        photo: candidature.photo
      }
    }));
  }

  /**
   * Map API status to display status
   */
  private mapStatutToStatus(statut: string): 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'applied';
      case 'EN_COURS':
        return 'screening';
      case 'ACCEPTE':
        return 'hired';
      case 'REJETE':
        return 'rejected';
      default:
        return 'applied';
    }
  }

  /**
   * Map display status back to API status
   */
  mapStatusToStatut(status: string): string {
    switch (status) {
      case 'applied':
        return 'EN_ATTENTE';
      case 'screening':
        return 'EN_COURS';
      case 'interview':
        return 'EN_COURS';
      case 'offer':
        return 'EN_COURS';
      case 'hired':
        return 'ACCEPTE';
      case 'rejected':
        return 'REJETE';
      default:
        return 'EN_ATTENTE';
    }
  }

  /**
   * Calculate years of experience from experience array
   */
  private calculateExperience(experiences: string[]): number {
    if (!experiences || experiences.length === 0) {
      return 0;
    }

    // Try to extract years from experience strings
    let totalYears = 0;
    experiences.forEach(exp => {
      const yearMatch = exp.match(/(\d+)\s*(an|année|year)/i);
      if (yearMatch) {
        totalYears += parseInt(yearMatch[1]);
      }
    });

    return totalYears || experiences.length; // Fallback to number of experiences
  }

  /**
   * Try to extract phone number from profile data or experiences
   */
  private extractPhoneFromProfile(candidature: CandidatureResponse): string | null {
    // This is a simple implementation - in reality, phone numbers might be
    // stored in a separate field or extracted from contact information
    
    // You could look for phone patterns in description or experiences
    const allText = [
      candidature.description || '',
      ...(candidature.experiences || [])
    ].join(' ');
    
    // Simple phone number regex (adjust based on your data format)
    const phoneRegex = /(\+?\d{1,4}[\s\-\.]?\(?\d{1,3}\)?[\s\-\.]?\d{1,4}[\s\-\.]?\d{1,4}[\s\-\.]?\d{1,9})/;
    const match = allText.match(phoneRegex);
    
    return match ? match[1] : null;
  }
}
