export enum StatutCandidature {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTE = 'ACCEPTE',
  REJETE = 'REJETE',
  EN_COURS = 'EN_COURS'
}

export interface CandidatureDto {
  id: string;
  dateCandidature: Date;
  statut: StatutCandidature;
  candidatId: string;
  offreId: string;
  profilId: string;
}
