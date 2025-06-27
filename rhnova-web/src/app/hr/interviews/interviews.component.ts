import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  InterviewService, 
  InterviewResponse, 
  AvailableCandidate,
  CreateInterviewRequest,
  UpdateInterviewRequest
} from './services/interview.service';
import { StatutEntretien } from '../../shared/models/interview.model';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './interviews.component.html',
  styleUrls: ['./interviews.component.scss']
})
export class InterviewsComponent implements OnInit {
  interviews: InterviewResponse[] = [];
  filteredInterviews: InterviewResponse[] = [];
  availableCandidates: AvailableCandidate[] = [];
  isLoading = false;
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';
  showModal = false;
  isEditing = false;
  interviewForm: FormGroup;
  selectedInterview: InterviewResponse | null = null;

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PLANIFIE', label: 'Planifié' },
    { value: 'CONFIRME', label: 'Confirmé' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ANNULE', label: 'Annulé' },
    { value: 'REPORTE', label: 'Reporté' }
  ];

  typeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'TECHNIQUE', label: 'Technique' },
    { value: 'RH', label: 'RH' },
    { value: 'COMPORTEMENTAL', label: 'Comportemental' },
    { value: 'DIRECTION', label: 'Direction' },
    { value: 'TELEPHONIQUE', label: 'Téléphonique' }
  ];

  constructor(
    private interviewService: InterviewService,
    private fb: FormBuilder  ) {
    this.interviewForm = this.fb.group({
      candidatureId: ['', Validators.required],
      dateEntretien: ['', Validators.required],
      heureEntretien: ['', Validators.required],
      dureeMinutes: [60, [Validators.required, Validators.min(15)]],
      type: ['TECHNIQUE', Validators.required],
      statut: [StatutEntretien.PLANIFIE, Validators.required],
      lieu: [''],
      lienVisio: [''],
      objectifs: [''],
      commentaires: [''],
      note: ['', [Validators.min(0), Validators.max(20)]]
    });
  }
  ngOnInit(): void {
    this.loadInterviews();
    this.loadAvailableCandidates();
  }

  loadInterviews(): void {
    this.isLoading = true;
    this.interviewService.getAllInterviews().subscribe({
      next: (interviews: InterviewResponse[]) => {
        console.log('Interviews loaded:', interviews);
        this.interviews = interviews;
        this.filteredInterviews = interviews;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading interviews:', error);
        this.isLoading = false;
      }
    });
  }

  loadAvailableCandidates(): void {
    this.interviewService.getAvailableCandidates().subscribe({
      next: (candidates: AvailableCandidate[]) => {
        this.availableCandidates = candidates;
      },
      error: (error: any) => {
        console.error('Error loading available candidates:', error);
      }
    });
  }
  filterInterviews(): void {
    this.filteredInterviews = this.interviews.filter(interview => {
      const matchesSearch = !this.searchTerm || 
        interview.candidatNom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        interview.candidatEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        interview.titreOffre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (interview.lieu && interview.lieu.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.selectedStatus || interview.statut === this.selectedStatus;
      const matchesType = !this.selectedType || interview.type === this.selectedType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }  openCreateModal(): void {
    this.isEditing = false;
    this.selectedInterview = null;
    this.interviewForm.reset();
    this.interviewForm.patchValue({ 
      statut: StatutEntretien.PLANIFIE, 
      type: 'TECHNIQUE',
      dureeMinutes: 60 
    });
    this.showModal = true;
  }

  openEditModal(interview: InterviewResponse): void {
    this.isEditing = true;
    this.selectedInterview = interview;
    
    // Map the interview data for the form
    const mappedData = this.interviewService.mapToComponentFormat(interview);
    
    this.interviewForm.patchValue({
      candidatureId: mappedData.candidatureId,
      dateEntretien: mappedData.dateEntretien,
      heureEntretien: mappedData.heureEntretien,
      dureeMinutes: mappedData.dureeMinutes,
      type: mappedData.type,
      statut: mappedData.statut,
      lieu: mappedData.lieu,
      lienVisio: mappedData.lienVisio,
      objectifs: mappedData.objectifs,
      commentaires: mappedData.commentaires,
      note: mappedData.note
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.interviewForm.reset();
    this.selectedInterview = null;
  }
  onSubmit(): void {
    if (this.interviewForm.valid) {
      const formData = this.interviewForm.value;
      
      // Map form data to API format
      const interviewData = this.interviewService.mapToApiFormat(formData);
      
      if (this.isEditing && this.selectedInterview) {
        this.interviewService.updateInterview(this.selectedInterview.id, interviewData as UpdateInterviewRequest).subscribe({
          next: () => {
            this.loadInterviews();
            this.closeModal();
          },
          error: (error: any) => {
            console.error('Error updating interview:', error);
          }
        });
      } else {
        this.interviewService.createInterview(interviewData as CreateInterviewRequest).subscribe({
          next: () => {
            this.loadInterviews();
            this.closeModal();
          },
          error: (error: any) => {
            console.error('Error creating interview:', error);
          }
        });
      }
    }
  }

  deleteInterview(interview: InterviewResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cet entretien avec ${interview.candidatNom} ?`)) {
      this.interviewService.deleteInterview(interview.id).subscribe({
        next: () => {
          this.loadInterviews();
        },
        error: (error: any) => {
          console.error('Error deleting interview:', error);
        }
      });
    }
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'TERMINE': return 'status-completed';
      case 'EN_COURS': return 'status-in-progress';
      case 'CONFIRME': return 'status-confirmed';
      case 'ANNULE': return 'status-cancelled';
      case 'REPORTE': return 'status-postponed';
      default: return 'status-planned';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'TECHNIQUE': return 'type-technical';
      case 'RH': return 'type-hr';
      case 'COMPORTEMENTAL': return 'type-behavioral';
      case 'DIRECTION': return 'type-management';
      case 'TELEPHONIQUE': return 'type-phone';
      default: return 'type-default';
    }
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getTypeLabel(type: string): string {
    const option = this.typeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }
  isUpcoming(dateEntretien: string): boolean {
    // Use the original datetime from the API response
    return new Date(dateEntretien) > new Date();
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h${remainingMinutes > 0 ? remainingMinutes : ''}`;
    }
    return `${minutes}min`;
  }
  /**
   * Quick status update methods
   */
  confirmInterview(interview: InterviewResponse): void {
    this.updateStatus(interview, StatutEntretien.CONFIRME);
  }

  startInterview(interview: InterviewResponse): void {
    this.updateStatus(interview, StatutEntretien.EN_COURS);
  }

  completeInterview(interview: InterviewResponse): void {
    this.updateStatus(interview, StatutEntretien.TERMINE);
  }

  cancelInterview(interview: InterviewResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler cet entretien avec ${interview.candidatNom} ?`)) {
      this.updateStatus(interview, StatutEntretien.ANNULE);
    }
  }
  postponeInterview(interview: InterviewResponse): void {
    this.updateStatus(interview, StatutEntretien.REPORTE);
  }

  private updateStatus(interview: InterviewResponse, status: StatutEntretien): void {
    this.interviewService.updateInterviewStatus(interview.id, { statut: status }).subscribe({
      next: () => {
        this.loadInterviews();
      },
      error: (error: any) => {
        console.error('Error updating interview status:', error);
      }
    });
  }

  /**
   * Quick note and evaluation methods
   */
  openNoteModal(interview: InterviewResponse): void {
    // You can implement a separate modal for quick note addition
    const note = prompt(`Ajouter une note pour l'entretien avec ${interview.candidatNom} (0-20):`);
    const comments = prompt('Commentaires (optionnel):');
    
    if (note !== null) {
      const noteValue = parseFloat(note);
      if (!isNaN(noteValue) && noteValue >= 0 && noteValue <= 20) {
        this.interviewService.updateInterviewNote(interview.id, {
          note: noteValue,
          commentaires: comments || undefined
        }).subscribe({
          next: () => {
            this.loadInterviews();
          },
          error: (error: any) => {
            console.error('Error updating interview note:', error);
          }
        });
      } else {
        alert('La note doit être comprise entre 0 et 20');
      }
    }
  }

  /**
   * Filter methods for quick filtering
   */
  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.filterInterviews();
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.filterInterviews();
  }

  filterByDate(date: string): void {
    this.interviewService.getInterviewsByDate(date).subscribe({
      next: (interviews: InterviewResponse[]) => {
        this.interviews = interviews;
        this.filteredInterviews = interviews;
      },
      error: (error: any) => {
        console.error('Error filtering interviews by date:', error);
      }
    });
  }

  /**
   * Utility methods
   */  canBeConfirmed(interview: InterviewResponse): boolean {
    return interview.statut === StatutEntretien.PLANIFIE;
  }

  canBeStarted(interview: InterviewResponse): boolean {
    return interview.statut === StatutEntretien.CONFIRME || interview.statut === StatutEntretien.PLANIFIE;
  }

  canBeCompleted(interview: InterviewResponse): boolean {
    return interview.statut === StatutEntretien.EN_COURS;
  }

  canBeCancelled(interview: InterviewResponse): boolean {
    return interview.statut !== StatutEntretien.TERMINE && interview.statut !== StatutEntretien.ANNULE;
  }

  canAddNote(interview: InterviewResponse): boolean {
    return interview.statut === StatutEntretien.TERMINE;
  }
}
