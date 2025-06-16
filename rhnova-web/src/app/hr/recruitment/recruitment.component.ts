import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.scss']
})
export class RecruitmentComponent implements OnInit {
  activeTab: 'jobs' | 'candidates' = 'jobs';
  jobPostings: JobPosting[] = [];
  candidates: Candidate[] = [];
  filteredJobs: JobPosting[] = [];
  filteredCandidates: Candidate[] = [];
  
  jobForm: FormGroup;
  searchForm: FormGroup;
  showJobModal = false;
  editingJob: JobPosting | null = null;

  constructor(private fb: FormBuilder) {
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
    this.loadCandidates();
    this.setupSearchSubscription();
  }

  loadJobPostings() {
    this.jobPostings = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'full-time',
        status: 'active',
        applicants: 24,
        postedDate: new Date('2024-01-15'),
        deadline: new Date('2024-03-15'),
        description: 'We are looking for an experienced frontend developer...'
      },
      {
        id: '2',
        title: 'HR Specialist',
        department: 'HR',
        location: 'New York',
        type: 'full-time',
        status: 'active',
        applicants: 12,
        postedDate: new Date('2024-02-01'),
        deadline: new Date('2024-04-01'),
        description: 'Join our HR team to help manage talent...'
      }
    ];
    this.filteredJobs = [...this.jobPostings];
  }

  loadCandidates() {
    this.candidates = [
      {
        id: '1',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1 (555) 123-4567',
        position: 'Senior Frontend Developer',
        status: 'interview',
        appliedDate: new Date('2024-01-20'),
        resume: 'sarah_wilson_resume.pdf',
        experience: 5
      },
      {
        id: '2',
        name: 'David Chen',
        email: 'david@example.com',
        phone: '+1 (555) 234-5678',
        position: 'HR Specialist',
        status: 'screening',
        appliedDate: new Date('2024-02-05'),
        resume: 'david_chen_resume.pdf',
        experience: 3
      }
    ];
    this.filteredCandidates = [...this.candidates];
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
  }

  updateCandidateStatus(candidate: Candidate, newStatus: string) {
    candidate.status = newStatus as any;
    // In real app, this would make an API call
  }
}
