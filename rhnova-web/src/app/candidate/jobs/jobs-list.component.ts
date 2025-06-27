import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  private searchSubject = new Subject<string>();

  constructor(private candidateService: CandidateService) {}
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
    this.candidateService.getAllJobOffers().subscribe({
      next: (jobOffers) => {
        // Convert JobOfferDisplay to Job interface with applied status
        const jobs: Job[] = jobOffers.map(offer => ({
          ...offer,
          applied: false // Initialize as not applied, will be updated by loadAppliedJobs
        }));
        
        this.allJobs.set(jobs);
        this.filteredJobs.set(jobs);
        
        // Load applied status after jobs are loaded
        this.loadAppliedJobs();
      },
      error: (error) => {
        console.error('Error loading job offers:', error);
        // Fallback to mock data if API fails
        this.loadMockJobs();
      }
    });
  }

  loadAppliedJobs() {
    // Get all jobs and check which ones the user has applied for
    const jobs = this.allJobs();
    
    jobs.forEach(job => {
      this.candidateService.hasAppliedForJob(job.id).subscribe({
        next: (hasApplied) => {
          job.applied = hasApplied;
          // Update the signals to trigger change detection
          this.allJobs.set([...this.allJobs()]);
          this.filterJobs(); // Re-apply filters with updated applied status
        },
        error: (error) => {
          console.error(`Error checking applied status for job ${job.id}:`, error);
        }
      });
    });
  }

  loadMockJobs() {
    // Keep mock data as fallback
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        department: 'Tech Solutions Inc.',
        location: 'Casablanca, Morocco',
        type: 'full-time',
        salary: '25,000 - 35,000 MAD',
        description: 'We are looking for a skilled Frontend Developer to join our dynamic team. You will be responsible for developing user-facing features using modern JavaScript frameworks and ensuring great user experience.',
        requirements: ['Angular', 'TypeScript', 'HTML/CSS', 'JavaScript', 'Git'],
        postedDate: new Date('2024-01-15'),
        deadline: new Date('2024-02-15'),
        status: 'active',
        applied: false
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        department: 'Innovation Labs',
        location: 'Rabat, Morocco',
        type: 'full-time',
        salary: '30,000 - 45,000 MAD',
        description: 'Join our team as a Full Stack Developer and work on exciting projects that make a real impact. You will work with both frontend and backend technologies.',
        requirements: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS'],
        postedDate: new Date('2024-01-10'),
        deadline: new Date('2024-02-10'),
        status: 'active',
        applied: true
      },
      {
        id: '3',
        title: 'UI/UX Designer',
        department: 'Creative Studio',
        location: 'Marrakech, Morocco',
        type: 'contract',
        salary: '200 - 300 MAD/day',
        description: 'We are seeking a creative UI/UX Designer to help us create beautiful and intuitive user interfaces for our web and mobile applications.',
        requirements: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
        postedDate: new Date('2024-01-12'),
        deadline: new Date('2024-02-20'),
        status: 'active',
        applied: false
      },
      {
        id: '4',
        title: 'Marketing Intern',
        department: 'StartupCorp',
        location: 'Remote',
        type: 'internship',
        salary: '3,000 MAD/month',
        description: 'Great opportunity for a marketing student to gain hands-on experience in digital marketing, social media management, and content creation.',
        requirements: ['Social Media', 'Content Writing', 'Analytics', 'Creativity'],
        postedDate: new Date('2024-01-08'),
        deadline: new Date('2024-01-30'),
        status: 'active',
        applied: false
      }
    ];

    this.allJobs.set(mockJobs);
    this.filteredJobs.set(mockJobs);
  }  filterJobs() {
    // Use API search if we have search filters, otherwise use local filtering
    if (this.searchTerm.trim() || this.selectedType || this.locationFilter.trim()) {
      this.candidateService.searchJobOffers(
        this.searchTerm, 
        this.selectedType || undefined, 
        this.locationFilter || undefined
      ).subscribe({
        next: (jobOffers) => {
          const jobs: Job[] = jobOffers.map(offer => ({
            ...offer,
            applied: false // This would ideally come from user's applications
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
    // Here you would navigate to job details page or open a modal
  }  applyForJob(job: Job) {
    if (!job.applied) {
      this.candidateService.applyForJob(job.id).subscribe({
        next: (response) => {
          if (response.success) {
            job.applied = true;
            // Update signals to trigger change detection
            this.allJobs.set([...this.allJobs()]);
            this.filterJobs();
            console.log('Successfully applied for job:', job);
            // You could show a success message here
            // this.notificationService.showSuccess('Application submitted successfully!');
          } else {
            console.error('Failed to apply for job:', response.message);
            // You could show an error message here
          }
        },
        error: (error) => {
          console.error('Error applying for job:', error);
          // You could show an error message here
          // this.notificationService.showError('Failed to submit application. Please try again.');
        }
      });
    }
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }
}
