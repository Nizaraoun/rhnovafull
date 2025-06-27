import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { EmployeeApiService, Employee } from '../employees/services/employee-api.service';
import { CandidatureService, CandidateDisplay } from '../shared/services/candidature.service';
import { LeaveManagementService, LeaveRequest } from '../leave-management/leave-management.service';
import { JobOfferService, JobOfferDisplay } from '../shared/services/job-offer.service';
import { AdminService } from '../../admin/services/admin.service';

interface JobOffer {
  id: string;
  title: string;
  department: string;
  applicants: number;
  status: 'open' | 'closed' | 'draft';
  postedDate: Date;
  deadline: Date;
}

interface DashboardLeaveRequest {
  id: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'maternity' | 'emergency';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HrDashboardComponent implements OnInit {
  employees = signal<Employee[]>([]);
  candidates = signal<CandidateDisplay[]>([]);
  jobOffers = signal<JobOfferDisplay[]>([]);
  leaveRequests = signal<LeaveRequest[]>([]);
  currentUser = signal<any>(null);
  loading = signal<boolean>(false);
  error = signal<string>('');

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeApiService,
    private candidatureService: CandidatureService,
    private leaveService: LeaveManagementService,
    private jobOfferService: JobOfferService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.currentUser.set(this.authService.getUserData());
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    this.loadEmployees();
    this.loadCandidatures();
    this.loadLeaveRequests();
    this.loadJobOffers();
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.error.set('Failed to load employees');
      }
    });
  }

  loadCandidatures() {
    this.candidatureService.getMyCandidatures().subscribe({
      next: (candidatures) => {
        const candidates = this.candidatureService.mapToDisplayFormat(candidatures);
        this.candidates.set(candidates);
        // Create mock job offers based on candidatures
        this.createJobOffersFromCandidatures(candidatures);
      },
      error: (error) => {
        console.error('Error loading candidatures:', error);
        this.error.set('Failed to load candidatures');
      }
    });
  }

  loadLeaveRequests() {
    this.leaveService.getAllLeaveRequests().subscribe({
      next: (requests) => {
        this.leaveRequests.set(requests);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
        this.error.set('Failed to load leave requests');
        this.loading.set(false);
      }
    });
  }
  loadJobOffers() {
    // Try to load from API first, fallback to mock data
    this.jobOfferService.getMockJobOffers().subscribe({
      next: (jobOffers) => {
        this.jobOffers.set(jobOffers);
      },
      error: (error) => {
        console.error('Error loading job offers:', error);
        // Fallback to creating job offers from candidatures
        this.createJobOffersFromCandidatures([]);
      }
    });
  }
  createJobOffersFromCandidatures(candidatures: any[]) {
    // Group candidatures by job title to create job offers
    const jobMap = new Map<string, any>();
    
    candidatures.forEach(candidature => {
      const title = candidature.offreTitre;
      if (!jobMap.has(title)) {
        jobMap.set(title, {
          id: candidature.offreId,
          title: title,
          department: this.extractDepartmentFromTitle(title),
          location: candidature.offreLocalisation || 'Not specified',
          type: 'CDI',
          applicants: 0,
          status: 'open' as const,
          postedDate: new Date(candidature.dateCandidature),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          description: candidature.offreDescription || 'No description available'
        });
      }
      
      const job = jobMap.get(title);
      if (job) {
        job.applicants++;
      }
    });

    const jobOffers = Array.from(jobMap.values());
    this.jobOffers.set(jobOffers);
  }

  private extractDepartmentFromTitle(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('developer') || titleLower.includes('engineer')) return 'Engineering';
    if (titleLower.includes('marketing')) return 'Marketing';
    if (titleLower.includes('sales')) return 'Sales';
    if (titleLower.includes('hr') || titleLower.includes('human')) return 'HR';
    if (titleLower.includes('finance')) return 'Finance';
    return 'Other';
  }
  getActiveEmployees(): number {
    return this.employees().filter(emp => emp.status === 'active').length;
  }

  getPendingLeaves(): number {
    return this.leaveRequests().filter(req => req.statut === 'EN_ATTENTE').length;
  }

  getTotalApplicants(): number {
    return this.candidates().length;
  }

  getPendingLeaveRequests(): LeaveRequest[] {
    return this.leaveRequests().filter(req => req.statut === 'EN_ATTENTE');
  }

  getRecentEmployees(): Employee[] {
    return this.employees().sort((a, b) => b.joinDate.getTime() - a.joinDate.getTime());
  }
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  getLeaveTypeLabel(type: string): string {
    switch (type) {
      case 'VACANCES':
        return 'Vacation';
      case 'MALADIE':
        return 'Sick';
      case 'MATERNITE':
        return 'Maternity';
      case 'PATERNITE':
        return 'Paternity';
      case 'SANS_SOLDE':
        return 'Unpaid';
      case 'AUTRE':
        return 'Other';
      default:
        return type;
    }
  }

  // Additional helper methods for dashboard
  getEmployeesByDepartment(): { [key: string]: number } {
    const deptCounts: { [key: string]: number } = {};
    this.employees().forEach(emp => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });
    return deptCounts;
  }

  getJobOffersByStatus(): { [key: string]: number } {
    const statusCounts: { [key: string]: number } = {};
    this.jobOffers().forEach(job => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });
    return statusCounts;
  }

  getCandidatesByStatus(): { [key: string]: number } {
    const statusCounts: { [key: string]: number } = {};
    this.candidates().forEach(candidate => {
      statusCounts[candidate.status] = (statusCounts[candidate.status] || 0) + 1;
    });
    return statusCounts;
  }

  // Refresh data method
  refreshDashboard(): void {
    this.error.set('');
    this.loadDashboardData();
  }

  approveLeave(leave: LeaveRequest) {
    console.log('Approve leave:', leave);
    this.leaveService.approveLeaveRequest(leave.id).subscribe({
      next: () => {
        console.log('Leave approved successfully');
        this.loadLeaveRequests(); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error approving leave:', error);
        this.error.set('Failed to approve leave request');
      }
    });
  }

  rejectLeave(leave: LeaveRequest) {
    console.log('Reject leave:', leave);
    this.leaveService.rejectLeaveRequest(leave.id).subscribe({
      next: () => {
        console.log('Leave rejected successfully');
        this.loadLeaveRequests(); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error rejecting leave:', error);
        this.error.set('Failed to reject leave request');
      }
    });
  }
}
