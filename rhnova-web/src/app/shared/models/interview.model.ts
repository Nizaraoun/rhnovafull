export enum StatutEntretien {
  PLANIFIE = 'PLANIFIE',
  CONFIRME = 'CONFIRME',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE',
  REPORTE = 'REPORTE'
}

export interface InterviewDto {
  id: string;
  candidatureId: string;
  dateEntretien: Date;
  statut: StatutEntretien;
  heureDebut?: string;
  heureFin?: string;
  lieu?: string;
  lienVisio?: string;
  type?: 'TECHNIQUE' | 'RH' | 'COMPORTEMENTAL' | 'DIRECTION' | 'TELEPHONIQUE';
  typeEntretien?: 'PHYSIQUE' | 'VIRTUEL' | 'TELEPHONIQUE';
  commentaires?: string;
  interviewerId?: string;
  interviewerName?: string;
  dureeMinutes?: number;
}

// Extended interface for displaying interview information
export interface InterviewDisplay {
  id: string;
  candidatureId: string;
  jobTitle: string;
  candidateName: string;
  dateEntretien: Date;
  statut: StatutEntretien;
  statusLabel: string;
  heureDebut?: string;
  heureFin?: string;
  lieu?: string;
  typeEntretien?: string;
  commentaires?: string;
  interviewerName?: string;
}

// Helper function to map StatutEntretien to display labels
export function mapStatutEntretienToLabel(statut: StatutEntretien): string {
  switch (statut) {
    case StatutEntretien.PLANIFIE:
      return 'Scheduled';
    case StatutEntretien.CONFIRME:
      return 'Confirmed';
    case StatutEntretien.EN_COURS:
      return 'In Progress';
    case StatutEntretien.TERMINE:
      return 'Completed';
    case StatutEntretien.ANNULE:
      return 'Cancelled';
    case StatutEntretien.REPORTE:
      return 'Postponed';
    default:
      return 'Unknown';
  }
}

// Helper function to map StatutEntretien to CSS classes for styling
export function mapStatutEntretienToClass(statut: StatutEntretien): string {
  switch (statut) {
    case StatutEntretien.PLANIFIE:
      return 'status-scheduled';
    case StatutEntretien.CONFIRME:
      return 'status-confirmed';
    case StatutEntretien.EN_COURS:
      return 'status-in-progress';
    case StatutEntretien.TERMINE:
      return 'status-completed';
    case StatutEntretien.ANNULE:
      return 'status-cancelled';
    case StatutEntretien.REPORTE:
      return 'status-postponed';
    default:
      return 'status-unknown';
  }
}
