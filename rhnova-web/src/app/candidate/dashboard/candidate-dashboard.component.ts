import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { CandidateService } from '../services/candidate.service';
import { JobOfferDisplay } from '../../shared/models/jobOfferBackend';
import { CandidatureDashboardDisplay } from '../../shared/models/candidature.model';

interface JobOffer extends JobOfferDisplay {
  // Additional properties specific to dashboard display if needed
}



@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidate-dashboard.component.html',
  styleUrls: ['./candidate-dashboard.component.scss']
})
export class CandidateDashboardComponent implements OnInit {
  recentJobs = signal<JobOffer[]>([]);
  applications = signal<CandidatureDashboardDisplay[]>([]);
  currentUser = signal<any>(null);

  constructor(
    private authService: AuthService,
    private candidateService: CandidateService
  ) {}

  ngOnInit() {
    this.currentUser.set(this.authService.getUserData());
    this.loadRecentJobs();
    this.loadApplications();
  }
  loadRecentJobs() {
    this.candidateService.getRecentJobOffers(3).subscribe({
      next: (jobOffers) => {
        this.recentJobs.set(jobOffers);
      },
      error: (error) => {
        console.error('Error loading recent jobs:', error);
        // Fallback to mock data
        this.loadMockJobs();
      }
    });
  }

  loadMockJobs() {
    // Mock data as fallback
    const mockJobs: JobOffer[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        department: 'Tech Solutions Inc.',
        location: 'Casablanca, Morocco',
        type: 'full-time',
        salary: '25,000 - 35,000 MAD',
        postedDate: new Date('2024-01-18'),
        deadline: new Date('2024-02-18'),
        status: 'active',
        description: ''
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        department: 'Innovation Labs',
        location: 'Rabat, Morocco',
        type: 'full-time',
        salary: '30,000 - 45,000 MAD',
        postedDate: new Date('2024-01-17'),
        deadline: new Date('2024-02-17'),
        status: 'active',
        description: ''
      },
      {
        id: '3',
        title: 'UI/UX Designer',
        department: 'Creative Studio',
        location: 'Marrakech, Morocco',
        type: 'contract',
        salary: '200 - 300 MAD/day',
        postedDate: new Date('2024-01-16'),
        deadline: new Date('2024-02-20'),
        status: 'active',
        description: ''
      }
    ];

    this.recentJobs.set(mockJobs);
  }  loadApplications() {
    this.candidateService.getCandidateApplicationsWithJobDetails().subscribe({
      next: (applications) => {
        this.applications.set(applications);
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        // Set empty array on error
        this.applications.set([]);
      }
    });
  }



  profileCompletionPercentage(): number {
    // Mock calculation - in real app, this would be calculated based on actual profile data
    return 75;
  }

  getPendingApplications(): number {
    return this.applications().filter(app => app.status === 'pending' || app.status === 'reviewing').length;
  }

  getInterviewCount(): number {
    return this.applications().filter(app => app.status === 'interview').length;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'pending': 'Pending',
      'reviewing': 'Under Review',
      'interview': 'Interview',
      'accepted': 'Accepted',
      'rejected': 'Not Selected'
    };
    return labels[status] || status;
  }  applyForJob(job: JobOffer) {
    this.candidateService.applyForJob(job.id).subscribe({
      next: (response) => {
        console.log('Successfully applied for job:', job);
        // Refresh applications list after successful application
        this.loadApplications();
        // You could show a success message
      },
      error: (error) => {
        console.error('Error applying for job:', error);
        // You could show an error message
      }
    });
  }
}
