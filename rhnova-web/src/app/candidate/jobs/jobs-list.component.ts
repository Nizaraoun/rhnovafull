import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CandidateService } from '../services/candidate.service';
import { JobOfferDisplay, JobOfferFilters } from '../../shared/models/jobOfferBackend';

interface Job extends JobOfferDisplay {
  applied: boolean; // Additional property for UI state
}

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements OnInit, OnDestroy {
  searchTerm = '';
  selectedType = '';
  locationFilter = '';
  
  allJobs = signal<Job[]>([]);
  filteredJobs = signal<Job[]>([]);
  isLoading = signal(true);
  isLoadingAppliedJobs = signal(false);
  private searchSubject = new Subject<string>();

  constructor(
    private candidateService: CandidateService,
    private router: Router
  ) {}
  ngOnInit() {
    this.loadJobs();
    this.loadAppliedJobs();

    // Debounce search term input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.filterJobs();
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
  loadJobs() {
    this.isLoading.set(true);
    this.candidateService.getAllJobOffers().subscribe({
      next: (jobOffers) => {
        console.log('Loaded job offers:', jobOffers);
        // Convert JobOfferDisplay to Job interface with applied status
        const jobs: Job[] = jobOffers.map(offer => ({
          ...offer,
          applied: false // Initialize as not applied, will be updated by loadAppliedJobs
        }));
        
        this.allJobs.set(jobs);
        this.filteredJobs.set(jobs);
        this.isLoading.set(false);
        
        // Load applied status after jobs are loaded
        this.loadAppliedJobs();
      },
      error: (error) => {
        console.error('Error loading job offers:', error);
        this.isLoading.set(false);
        // Fallback to empty array on error
        this.allJobs.set([]);
        this.filteredJobs.set([]);
      }
    });
  }

  loadAppliedJobs() {
    this.isLoadingAppliedJobs.set(true);
    // Get all candidatures once and check which jobs the user has applied for
    this.candidateService.getCandidateApplications().subscribe({
      next: (candidatures) => {
        console.log('Loaded candidatures:', candidatures);
        // Create a Set of applied job IDs for efficient lookup
        const appliedJobIds = new Set(candidatures.map(c => c.offreId));
        
        // Update jobs with applied status
        const jobs = this.allJobs().map(job => ({
          ...job,
          applied: appliedJobIds.has(job.id)
        }));
        
        this.allJobs.set(jobs);
        this.filterJobs(); // Re-apply filters with updated applied status
        this.isLoadingAppliedJobs.set(false);
      },
      error: (error) => {
        console.error('Error loading applied jobs:', error);
        this.isLoadingAppliedJobs.set(false);
        // Continue with jobs even if we can't load applied status
      }
    });
  }

  filterJobs() {
    // Use API search if we have search filters, otherwise use local filtering
    if (this.searchTerm.trim() || this.selectedType || this.locationFilter.trim()) {
      this.candidateService.searchJobOffers(
        this.searchTerm, 
        this.selectedType || undefined, 
        this.locationFilter || undefined
      ).subscribe({
        next: (jobOffers) => {
          // Get current applied status from existing jobs
          const currentAppliedStatus = new Map<string, boolean>();
          this.allJobs().forEach(job => {
            currentAppliedStatus.set(job.id, job.applied);
          });
          
          const jobs: Job[] = jobOffers.map(offer => ({
            ...offer,
            applied: currentAppliedStatus.get(offer.id) || false
          }));
          this.filteredJobs.set(jobs);
        },
        error: (error) => {
          console.error('Error searching jobs:', error);
          // Fallback to local filtering
          this.filterJobsLocally();
        }
      });
    } else {
      // No filters, show all jobs
      this.filteredJobs.set(this.allJobs());
    }
  }

  private filterJobsLocally() {
    let filtered = this.allJobs();

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower)
      );
    }

    // Filter by job type
    if (this.selectedType) {
      filtered = filtered.filter(job => job.type === this.selectedType);
    }

    // Filter by location
    if (this.locationFilter.trim()) {
      const locationLower = this.locationFilter.toLowerCase();
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }

    this.filteredJobs.set(filtered);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  viewJobDetails(job: Job) {
    console.log('View job details:', job);
  }  applyForJob(job: Job) {
    if (!job.applied) {
      this.candidateService.applyForJob(job.id).subscribe({
        next: (response) => {
          if (response.success) {
            job.applied = true;
            
            const allJobs = this.allJobs().map(j => j.id === job.id ? { ...j, applied: true } : j);
            this.allJobs.set(allJobs);
            
            const filteredJobs = this.filteredJobs().map(j => j.id === job.id ? { ...j, applied: true } : j);
            this.filteredJobs.set(filteredJobs);
            
            console.log('Successfully applied for job:', job);
            alert('Application submitted successfully!');
            this.router.navigate(['/candidate/dashboard']);
            
          } else {
            alert('Application submitted successfully!');
            this.router.navigate(['/candidate/dashboard']);
            // You could show an error message here
          }
        },
        error: (error) => {
          console.error('Error applying for job:', error);
        }
      });
    }
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }
}
