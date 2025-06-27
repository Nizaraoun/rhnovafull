export enum StatutCandidature {
  EN_ATTENTE = 'EN_ATTENTE',
  ENTRETIEN_PLANIFIE = 'ENTRETIEN_PLANIFIE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}

export interface CandidatureDto {
  id: string;
  dateCandidature: Date;
  statut: StatutCandidature;
  candidatId: string;
  offreId: string;
  profilId: string;
}

// Extended interface for dashboard display with job offer details
export interface CandidatureDashboardDisplay {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: Date;
  status: string; // Simplified status for display
  jobOfferId: string;
  originalStatus: StatutCandidature;
}

// Helper function to map statut to display status
export function mapStatutToDisplayStatus(statut: StatutCandidature): string {
  switch (statut) {
    case StatutCandidature.EN_ATTENTE:
      return 'pending';
    case StatutCandidature.ENTRETIEN_PLANIFIE:
      return 'interview';
    case StatutCandidature.ACCEPTEE:
      return 'accepted';
    case StatutCandidature.REFUSEE:
      return 'rejected';
    default:
      return 'pending';
  }
}
