import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CandidatureService } from '../../shared/services/candidature.service';
import { CandidateService } from '../services/candidate.service';
import { CandidatureDto, StatutCandidature } from '../../shared/models/candidature.model';
import { JobOfferDisplay } from '../../shared/models/jobOfferBackend';
import { StatutEntretien, mapStatutEntretienToLabel, InterviewDto } from '../../shared/models/interview.model';
import { InterviewService } from '../../shared/services/interview.service';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: Date;
  status: 'pending' | 'interview' | 'accepted' | 'rejected';
  interviewDate?: Date;
  heureEntretien?: string;
  interviewStatus?: StatutEntretien;
  interviewStatusLabel?: string;
  interviewLink?: string;
  interviewLocation?: string;
  interviewType?: string;
  location: string;
  salary: string;
  jobOffer?: JobOfferDisplay;
}

@Component({  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  applications = signal<Application[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  constructor(
    private candidatureService: CandidatureService,
    private candidateService: CandidateService,
    private interviewService: InterviewService
  ) {}
  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading.set(true);
    this.error.set(null);

    this.candidatureService.getMyCandidatures().subscribe({
      next: (candidatures) => {
        console.log('Loaded candidatures:', candidatures);
        this.loadJobOfferDetails(candidatures);
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.error.set('Failed to load applications');
        this.loading.set(false);
        // Fallback to mock data
      }
    });
  }
  loadJobOfferDetails(candidatures: CandidatureDto[]) {
    if (candidatures.length === 0) {
      this.applications.set([]);
      this.loading.set(false);
      return;
    }

    const applications: Application[] = [];
    let processed = 0;

    candidatures.forEach(candidature => {
      this.candidateService.getJobOfferById(candidature.offreId).subscribe({
        next: (jobOffer) => {
          // Check for interviews for this candidature
          this.interviewService.getInterviewsByCandidature(candidature.id).subscribe({
            next: (interviews) => {
              const application = this.mapCandidatureToApplication(candidature, jobOffer, interviews);
              applications.push(application);
              processed++;
              
              if (processed === candidatures.length) {
                // Sort by application date (newest first)
                applications.sort((a, b) => b.appliedDate.getTime() - a.appliedDate.getTime());
                this.applications.set(applications);
                this.loading.set(false);
              }
            },
            error: (error) => {
              console.error(`Error loading interviews for candidature ${candidature.id}:`, error);
              // Create application without interview details
              const application = this.mapCandidatureToApplication(candidature, jobOffer);
              applications.push(application);
              processed++;
              
              if (processed === candidatures.length) {
                applications.sort((a, b) => b.appliedDate.getTime() - a.appliedDate.getTime());
                this.applications.set(applications);
                this.loading.set(false);
              }
            }
          });
        },
        error: (error) => {
          console.error(`Error loading job offer ${candidature.offreId}:`, error);
          // Create a basic application without job details
          const application = this.mapCandidatureToApplication(candidature);
          applications.push(application);
          processed++;
          
          if (processed === candidatures.length) {
            applications.sort((a, b) => b.appliedDate.getTime() - a.appliedDate.getTime());
            this.applications.set(applications);
            this.loading.set(false);
          }
        }
      });
    });
  }  mapCandidatureToApplication(candidature: CandidatureDto, jobOffer?: JobOfferDisplay, interviews?: InterviewDto[]): Application {
    // Map backend status to frontend status
    let frontendStatus: Application['status'];
    switch (candidature.statut) {
      case StatutCandidature.EN_ATTENTE:
        frontendStatus = 'pending';
        break;
      case StatutCandidature.ENTRETIEN_PLANIFIE:
        frontendStatus = 'interview';
        break;
      case StatutCandidature.ACCEPTEE:
        frontendStatus = 'accepted';
        break;
      case StatutCandidature.REFUSEE:
        frontendStatus = 'rejected';
        break;
      default:
        frontendStatus = 'pending';
    }

    // Get the most recent interview if any
    let latestInterview: InterviewDto | undefined;
    if (interviews && interviews.length > 0) {
      latestInterview = interviews.sort((a, b) => 
        new Date(b.dateEntretien).getTime() - new Date(a.dateEntretien).getTime()
      )[0];
    }    return {
      id: candidature.id,
      jobTitle: jobOffer?.title || 'Job Title Not Available',
      company: jobOffer?.department || 'Company Not Available',
      appliedDate: new Date(candidature.dateCandidature),
      status: frontendStatus,
      interviewDate: latestInterview ? new Date(latestInterview.dateEntretien) : undefined,
      heureEntretien: latestInterview?.heureEntretien,
      interviewStatus: latestInterview?.statut,
      interviewStatusLabel: latestInterview ? mapStatutEntretienToLabel(latestInterview.statut) : undefined,
      interviewLink: latestInterview?.lienVisio,
      interviewLocation: latestInterview?.lieu,
      interviewType: latestInterview?.type,
      location: jobOffer?.location || 'Location Not Available',
      salary: jobOffer?.salary || 'Salary Not Available',
      jobOffer: jobOffer
    };
  }
 
  getTotalApplications(): number {
    return this.applications().length;
  }

  getPendingApplications(): number {
    return this.applications().filter(app => app.status === 'pending').length;
  }

  getInterviewApplications(): number {
    return this.applications().filter(app => app.status === 'interview').length;
  }

  getAcceptedApplications(): number {
    return this.applications().filter(app => app.status === 'accepted').length;
  }
  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'pending': 'Pending',
      'interview': 'Interview',
      'accepted': 'Accepted',
      'rejected': 'Not Selected'
    };
    return labels[status] || status;
  }
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }
  getInterviewStatusLabel(status?: StatutEntretien): string {
    if (!status) return '';
    return mapStatutEntretienToLabel(status);
  }

  formatInterviewDate(date?: Date, heureEntretien?: string): string {
    if (!date) return '';
    
    const dateStr = date.toLocaleDateString('fr-FR');
    
    // If we have a specific interview time, use it; otherwise use the date's time
    if (heureEntretien && heureEntretien.trim()) {
      return `${dateStr} à ${heureEntretien}`;
    } else {
      return dateStr + ' à ' + date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
  hasUpcomingInterview(application: Application): boolean {
    if (!application.interviewDate || !application.interviewStatus) return false;
    
    const now = new Date();
    return application.interviewDate >= now && (
      application.interviewStatus === StatutEntretien.PLANIFIE ||
      application.interviewStatus === StatutEntretien.CONFIRME
    );
  }

  hasInterviewLink(application: Application): boolean {
    return !!(application.interviewLink && application.interviewLink.trim());
  }

  canJoinInterview(application: Application): boolean {
    if (!this.hasInterviewLink(application) || !application.interviewDate) return false;
    
    const now = new Date();
    const interviewTime = application.interviewDate.getTime();
    const thirtyMinutesBefore = interviewTime - (30 * 60 * 1000);
    const sixHoursAfter = interviewTime + (6 * 60 * 60 * 1000);
    
    return now.getTime() >= thirtyMinutesBefore && 
           now.getTime() <= sixHoursAfter &&
           (application.interviewStatus === StatutEntretien.PLANIFIE ||
            application.interviewStatus === StatutEntretien.CONFIRME ||
            application.interviewStatus === StatutEntretien.EN_COURS);
  }

  getInterviewTypeLabel(type?: string): string {
    const types: {[key: string]: string} = {
      'TECHNIQUE': 'Technique',
      'RH': 'RH',
      'COMPORTEMENTAL': 'Comportemental',
      'DIRECTION': 'Direction',
      'TELEPHONIQUE': 'Téléphonique'
    };
    return type ? types[type] || type : '';
  }
}
