import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Candidate, AdminService } from '../services/admin.service';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent implements OnInit {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  isLoading = false;
  searchTerm = '';
  selectedStatus = '';
  showModal = false;
  isEditing = false;
  candidateForm: FormGroup;
  selectedCandidate: Candidate | null = null;

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'ACCEPTE', label: 'Accepté' },
    { value: 'REJETE', label: 'Rejeté' },
    { value: 'EN_COURS', label: 'En cours' }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.candidateForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      competences: [''],
      experience: ['', [Validators.min(0)]],
      salaireSouhaite: ['', [Validators.min(0)]],
      statut: ['EN_ATTENTE', Validators.required],
      cvUrl: [''],
      lettreMotivationUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadCandidates();
  }
  loadCandidates(): void {
    this.isLoading = true;
    this.adminService.getAllCandidates().subscribe({
      next: (candidates: Candidate[]) => {
        this.candidates = candidates;
        this.filteredCandidates = candidates;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading candidates:', error);
        this.isLoading = false;
      }
    });
  }

  filterCandidates(): void {
    this.filteredCandidates = this.candidates.filter(candidate => {
      const matchesSearch = !this.searchTerm || 
        candidate.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || candidate.statut === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedCandidate = null;
    this.candidateForm.reset();
    this.candidateForm.patchValue({ statut: 'EN_ATTENTE' });
    this.showModal = true;
  }

  openEditModal(candidate: Candidate): void {
    this.isEditing = true;
    this.selectedCandidate = candidate;
    this.candidateForm.patchValue(candidate);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.candidateForm.reset();
    this.selectedCandidate = null;
  }
  onSubmit(): void {
    if (this.candidateForm.valid) {
      const candidateData = this.candidateForm.value;
      
      if (this.isEditing && this.selectedCandidate) {
        this.adminService.updateCandidate(this.selectedCandidate.id, candidateData).subscribe({
          next: () => {
            this.loadCandidates();
            this.closeModal();
          },
          error: (error: any) => console.error('Error updating candidate:', error)
        });
      } else {
        this.adminService.createCandidate(candidateData).subscribe({
          next: () => {
            this.loadCandidates();
            this.closeModal();
          },
          error: (error: any) => console.error('Error creating candidate:', error)
        });
      }
    }
  }

  deleteCandidate(candidate: Candidate): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le candidat ${candidate.prenom} ${candidate.nom} ?`)) {
      this.adminService.deleteCandidate(candidate.id).subscribe({
        next: () => this.loadCandidates(),
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTE': return 'status-accepted';
      case 'REJETE': return 'status-rejected';
      case 'EN_COURS': return 'status-in-progress';
      default: return 'status-pending';
    }
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }
}
