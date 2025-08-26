import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidatureService, CandidateDisplay, CandidatureResponse } from '../shared/services/candidature.service';
import { CandidateProfileModalComponent } from './candidate-profile-modal/candidate-profile-modal.component';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  status: 'active' | 'inactive' | 'filled';
  applicants: number;
  postedDate: Date;
  deadline: Date;
  description: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedDate: Date;
  resume: string;
  experience: number;
}

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CandidateProfileModalComponent],
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.scss']
})
export class RecruitmentComponent implements OnInit {
  activeTab: 'jobs' | 'candidates' = 'candidates'; // Changed default to candidates
  jobPostings: JobPosting[] = [];
  candidates: CandidateDisplay[] = []; // Changed to use CandidateDisplay type
  filteredJobs: JobPosting[] = [];
  filteredCandidates: CandidateDisplay[] = []; // Changed to use CandidateDisplay type
  
  jobForm: FormGroup;
  searchForm: FormGroup;  showJobModal = false;
  editingJob: JobPosting | null = null;
  loading = false;
  error: string | null = null;
  
  // Profile modal properties
  showProfileModal = false;
  selectedCandidate: CandidateDisplay | null = null;

  constructor(
    private fb: FormBuilder,
    private candidatureService: CandidatureService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      status: [''],
      department: ['']
    });

    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      department: ['', Validators.required],
      location: ['', Validators.required],
      type: ['', Validators.required],
      deadline: ['', Validators.required],
      description: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.loadJobPostings();
    this.loadCandidatesFromAPI();
    this.setupSearchSubscription();
  }

  loadJobPostings() {
    this.jobPostings = [
     
    ];
    this.filteredJobs = [...this.jobPostings];
  }
  loadCandidatesFromAPI() {
    this.loading = true;
    this.error = null;
    
    this.candidatureService.getMyCandidatures().subscribe({
      next: (candidatures: CandidatureResponse[]) => {
        this.candidates = this.candidatureService.mapToDisplayFormat(candidatures);
        this.filteredCandidates = [...this.candidates];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading candidatures:', error);
        this.error = 'Failed to load candidates. Please try again.';
        this.loading = false;
        // Fallback to empty array in case of error
        this.candidates = [];
        this.filteredCandidates = [];
      }
    });
  }

  setupSearchSubscription() {
    this.searchForm.valueChanges.subscribe(filters => {
      if (this.activeTab === 'jobs') {
        this.filterJobs(filters);
      } else {
        this.filterCandidates(filters);
      }
    });
  }

  filterJobs(filters: any) {
    this.filteredJobs = this.jobPostings.filter(job => {
      const matchesSearch = !filters.searchTerm || 
        job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesDepartment = !filters.department || job.department === filters.department;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }

  filterCandidates(filters: any) {
    this.filteredCandidates = this.candidates.filter(candidate => {
      const matchesSearch = !filters.searchTerm || 
        candidate.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = !filters.status || candidate.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }

  switchTab(tab: 'jobs' | 'candidates') {
    this.activeTab = tab;
    this.searchForm.reset();
  }

  openJobModal(job?: JobPosting) {
    this.editingJob = job || null;
    this.showJobModal = true;
    if (job) {
      this.jobForm.patchValue({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        deadline: job.deadline.toISOString().split('T')[0],
        description: job.description
      });
    } else {
      this.jobForm.reset();
    }
  }

  closeJobModal() {
    this.showJobModal = false;
    this.editingJob = null;
    this.jobForm.reset();
  }

  saveJob() {
    if (this.jobForm.valid) {
      const formValue = this.jobForm.value;
      if (this.editingJob) {
        const index = this.jobPostings.findIndex(job => job.id === this.editingJob!.id);
        if (index !== -1) {
          this.jobPostings[index] = {
            ...this.editingJob,
            ...formValue,
            deadline: new Date(formValue.deadline)
          };
        }
      } else {
        const newJob: JobPosting = {
          id: Date.now().toString(),
          ...formValue,
          deadline: new Date(formValue.deadline),
          status: 'active' as const,
          applicants: 0,
          postedDate: new Date()
        };
        this.jobPostings.push(newJob);
      }
      this.filterJobs(this.searchForm.value);
      this.closeJobModal();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': case 'interview': case 'offer': return 'status-active';
      case 'inactive': case 'rejected': return 'status-inactive';
      case 'filled': case 'hired': return 'status-success';
      case 'applied': case 'screening': return 'status-pending';
      default: return '';
    }
  }  viewCandidateProfile(candidate: CandidateDisplay) {
    this.selectedCandidate = candidate;
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedCandidate = null;
  }

  updateCandidateStatus(candidate: CandidateDisplay, newStatus: string) {
    const originalStatus = candidate.status;
    candidate.status = newStatus as any;
    
    // Map display status to API status
    const apiStatut = this.candidatureService.mapStatusToStatut(newStatus);
    
    this.candidatureService.updateCandidatureStatus(candidate.id, apiStatut).subscribe({
      next: () => {
        console.log('Status updated successfully');
      },
      error: (error) => {
        console.error('Error updating status:', error);
        // Revert the status change on error
        candidate.status = originalStatus;
        this.error = 'Failed to update candidate status. Please try again.';
      }
    });
  }
  scheduleInterview(candidate: CandidateDisplay) {
    // Logic to schedule an interview for the candidate
    console.log(`Scheduling interview for candidate ${candidate.name}`);
  }

  getCandidateImageUrl(candidate: CandidateDisplay): string {
    if (!candidate?.profileData?.photo) return '';
    
    const photoPath = candidate.profileData.photo;
    // Use the same API endpoint as in other components
    const baseUrl = 'http://localhost:8080';
    const apiUrl = `${baseUrl}/api/profil/image?url=${encodeURIComponent(photoPath)}`;
    
    return apiUrl;
  }

  onImageError(event: any): void {
    console.error('Error loading candidate image:', event);
    // Hide the image on error
    event.target.style.display = 'none';
  }
}