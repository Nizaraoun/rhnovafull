import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileViewComponent } from '../../../candidate/profile-view/profile-view.component';
import { CandidateDisplay } from '../../shared/services/candidature.service';
import { ProfileDto } from '../../../shared/models/profile.model';

@Component({
  selector: 'app-candidate-profile-modal',
  standalone: true,
  imports: [CommonModule, ProfileViewComponent],
  templateUrl: './candidate-profile-modal.component.html',
  styleUrls: ['./candidate-profile-modal.component.scss']
})
export class CandidateProfileModalComponent implements OnInit {
  @Input() candidate: CandidateDisplay | null = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  profileData: ProfileDto | null = null;

  ngOnInit() {
    this.prepareProfileData();
  }

  ngOnChanges() {
    this.prepareProfileData();
  }
  prepareProfileData() {
    if (!this.candidate) {
      this.profileData = null;
      return;
    }

    // Map candidate data to ProfileDto format
    this.profileData = {
      userId: this.candidate.name,
      dateDeNaissance: this.candidate.profileData?.dateDeNaissance,
      ville: this.candidate.profileData?.ville,
      pays: this.candidate.profileData?.pays,
      codePostal: this.candidate.profileData?.codePostal,
      profession: this.candidate.profileData?.profession,
      formations: this.candidate.profileData?.formations || [],
      experiences: this.candidate.profileData?.experiences || [],
      competences: this.candidate.profileData?.competences || [],
      langues: this.candidate.profileData?.langues || [],
      certifications: this.candidate.profileData?.certifications || [],
      projets: this.candidate.profileData?.projets || [],
      description: this.candidate.profileData?.description,
      photoUrl: this.candidate.profileData?.photo,
      createdAt: this.candidate.appliedDate,
      updatedAt: new Date()
    };
  }

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }




  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'hired': return 'status-badge status-success';
      case 'rejected': return 'status-badge status-danger';
      case 'interview': case 'offer': return 'status-badge status-warning';
      case 'screening': return 'status-badge status-info';
      default: return 'status-badge status-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'applied': return 'Applied';
      case 'screening': return 'Under Review';
      case 'interview': return 'Interview Stage';
      case 'offer': return 'Offer Extended';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }
}
