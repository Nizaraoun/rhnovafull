import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Interview, AdminService } from '../services/admin.service';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './interviews.component.html',
  styleUrls: ['./interviews.component.scss']
})
export class InterviewsComponent implements OnInit {
  interviews: Interview[] = [];
  filteredInterviews: Interview[] = [];
  isLoading = false;
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';
  showModal = false;
  isEditing = false;
  interviewForm: FormGroup;
  selectedInterview: Interview | null = null;

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PLANIFIE', label: 'Planifié' },
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
    { value: 'DIRECTION', label: 'Direction' }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.interviewForm = this.fb.group({
      candidatId: ['', Validators.required],
      intervieweurId: ['', Validators.required],
      dateEntretien: ['', Validators.required],
      heureEntretien: ['', Validators.required],
      dureeMinutes: [60, [Validators.required, Validators.min(15)]],
      type: ['TECHNIQUE', Validators.required],
      statut: ['PLANIFIE', Validators.required],
      lieu: [''],
      lienVisio: [''],
      objectifs: [''],
      commentaires: [''],
      note: ['', [Validators.min(0), Validators.max(20)]]
    });
  }

  ngOnInit(): void {
    this.loadInterviews();
  }
  loadInterviews(): void {
    this.isLoading = true;
    this.adminService.getAllInterviews().subscribe({
      next: (interviews: Interview[]) => {
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

  filterInterviews(): void {
    this.filteredInterviews = this.interviews.filter(interview => {
      const matchesSearch = !this.searchTerm || 
        interview.candidatId.toString().includes(this.searchTerm) ||
        interview.intervieweurId.toString().includes(this.searchTerm) ||
        (interview.lieu && interview.lieu.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.selectedStatus || interview.statut === this.selectedStatus;
      const matchesType = !this.selectedType || interview.type === this.selectedType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedInterview = null;
    this.interviewForm.reset();
    this.interviewForm.patchValue({ 
      statut: 'PLANIFIE', 
      type: 'TECHNIQUE',
      dureeMinutes: 60 
    });
    this.showModal = true;
  }

  openEditModal(interview: Interview): void {
    this.isEditing = true;
    this.selectedInterview = interview;
    
    // Séparer la date et l'heure
    const dateTime = new Date(interview.dateEntretien);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().substr(0, 5);
    
    this.interviewForm.patchValue({
      ...interview,
      dateEntretien: date,
      heureEntretien: time
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
      
      // Combiner date et heure
      const dateEntretien = new Date(`${formData.dateEntretien}T${formData.heureEntretien}`);
      
      const interviewData = {
        ...formData,
        dateEntretien: dateEntretien.toISOString()
      };
      
      delete interviewData.heureEntretien;
      
      if (this.isEditing && this.selectedInterview) {
        this.adminService.updateInterview(this.selectedInterview.id, interviewData).subscribe({
          next: () => {
            this.loadInterviews();
            this.closeModal();
          },
        });
      } else {
        this.adminService.createInterview(interviewData).subscribe({
          next: () => {
            this.loadInterviews();
            this.closeModal();
          },
        });
      }
    }
  }

  deleteInterview(interview: Interview): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cet entretien ?`)) {
      this.adminService.deleteInterview(interview.id).subscribe({
        next: () => this.loadInterviews(),
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'TERMINE': return 'status-completed';
      case 'EN_COURS': return 'status-in-progress';
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
}
