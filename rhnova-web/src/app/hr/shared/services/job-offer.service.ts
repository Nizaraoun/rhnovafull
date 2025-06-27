import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../shared/services/base-http.service';

export interface JobOfferResponse {
  id: string;
  titre: string;
  description: string;
  localisation: string;
  departement: string;
  typeContrat: string;
  salaire?: number;
  dateCreation: string;
  dateExpiration: string;
  statut: 'ACTIF' | 'INACTIF' | 'EXPIRE';
  competencesRequises?: string[];
  experienceRequise?: string;
  niveauEtude?: string;
  candidatures?: number;
}

export interface JobOfferDisplay {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: 'open' | 'closed' | 'draft';
  postedDate: Date;
  deadline: Date;
  description: string;
  salary?: number;
}

@Injectable({
  providedIn: 'root'
})
export class JobOfferService extends BaseHttpService {

  /**
   * Get all job offers for HR
   */
  getMyJobOffers(): Observable<JobOfferResponse[]> {
    return this.get<JobOfferResponse[]>('/api/hr/job-offers');
  }

  /**
   * Create new job offer
   */
  createJobOffer(jobOffer: Partial<JobOfferResponse>): Observable<JobOfferResponse> {
    return this.post<JobOfferResponse>('/api/hr/job-offers', jobOffer);
  }

  /**
   * Update job offer
   */
  updateJobOffer(id: string, jobOffer: Partial<JobOfferResponse>): Observable<JobOfferResponse> {
    return this.put<JobOfferResponse>(`/api/hr/job-offers/${id}`, jobOffer);
  }

  /**
   * Delete job offer
   */
  deleteJobOffer(id: string): Observable<any> {
    return this.delete(`/api/hr/job-offers/${id}`);
  }

  /**
   * Map API response to display format
   */
  mapToDisplayFormat(jobOffers: JobOfferResponse[]): JobOfferDisplay[] {
    return jobOffers.map(offer => ({
      id: offer.id,
      title: offer.titre,
      department: offer.departement,
      location: offer.localisation,
      type: offer.typeContrat,
      applicants: offer.candidatures || 0,
      status: this.mapStatutToStatus(offer.statut),
      postedDate: new Date(offer.dateCreation),
      deadline: new Date(offer.dateExpiration),
      description: offer.description,
      salary: offer.salaire
    }));
  }

  /**
   * Map API status to display status
   */
  private mapStatutToStatus(statut: string): 'open' | 'closed' | 'draft' {
    switch (statut) {
      case 'ACTIF':
        return 'open';
      case 'INACTIF':
        return 'draft';
      case 'EXPIRE':
        return 'closed';
      default:
        return 'draft';
    }
  }

  /**
   * Get mock data for development
   */
  getMockJobOffers(): Observable<JobOfferDisplay[]> {
    const mockData: JobOfferDisplay[] = [
      
    ];

    return of(mockData);
  }
}
