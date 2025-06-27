import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveManagementService, LeaveRequest, TypeConge, StatutDemandeConge } from '../../hr/leave-management/leave-management.service';
import { finalize } from 'rxjs/operators';

interface DisplayLeaveRequest {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'En Attente' | 'Acceptée' | 'Refusée';
  submittedDate: Date;
  validationDate?: Date;
  managerNotes?: string;
  managerName?: string;
  statusClass: string;
  statusIcon: string;
  originalData?: LeaveRequest;
}

@Component({
  selector: 'app-my-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-leave-requests.component.html',
  styleUrls: ['./my-leave-requests.component.scss']
})
export class MyLeaveRequestsComponent implements OnInit {
  leaveRequests: DisplayLeaveRequest[] = [];
  filteredRequests: DisplayLeaveRequest[] = [];
  selectedStatus = 'all';
  selectedType = 'all';
  isLoading = false;
  error: string | null = null;

  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'En Attente', label: 'En attente' },
    { value: 'Acceptée', label: 'Acceptée' },
    { value: 'Refusée', label: 'Refusée' }
  ];

  typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'Congé payé', label: 'Congé payé' },
    { value: 'Congé maladie', label: 'Congé maladie' },
    { value: 'Congé maternité', label: 'Congé maternité' },
    { value: 'Congé paternité', label: 'Congé paternité' },
    { value: 'Congé sans solde', label: 'Congé sans solde' },
    { value: 'Autre', label: 'Autre' }
  ];

  constructor(
    private leaveManagementService: LeaveManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyLeaveRequests();
  }

  loadMyLeaveRequests(): void {
    this.isLoading = true;
    this.error = null;

    this.leaveManagementService.getMyLeaveRequests()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (apiRequests: LeaveRequest[]) => {
          this.leaveRequests = this.transformApiDataToDisplayFormat(apiRequests);
          this.filterRequests();
        },
        error: (error: any) => {
          console.error('Error loading my leave requests:', error);
          this.error = 'Erreur lors du chargement de vos demandes de congé';
          // Fallback to mock data for development
          this.loadMockData();
        }
      });
  }

  private transformApiDataToDisplayFormat(apiRequests: LeaveRequest[]): DisplayLeaveRequest[] {
    return apiRequests.map(apiRequest => {
      const status = this.mapStatus(apiRequest.statut);
      return {
        id: apiRequest.id,
        leaveType: this.mapLeaveType(apiRequest.typeConge),
        startDate: new Date(apiRequest.dateDebut),
        endDate: new Date(apiRequest.dateFin),
        totalDays: apiRequest.nombreJours,
        reason: apiRequest.raison || 'Aucune raison spécifiée',
        status: status,
        submittedDate: new Date(apiRequest.dateCreation),
        validationDate: apiRequest.dateValidation ? new Date(apiRequest.dateValidation) : undefined,
        managerNotes: apiRequest.commentaireValidateur || undefined,
        managerName: this.getManagerName(apiRequest),
        statusClass: this.getStatusClass(status),
        statusIcon: this.getStatusIcon(status),
        originalData: apiRequest
      };
    });
  }

  private mapLeaveType(apiType: TypeConge): string {
    const typeMap: { [key: string]: string } = {
      [TypeConge.VACANCES]: 'Congé payé',
      [TypeConge.MALADIE]: 'Congé maladie',
      [TypeConge.MATERNITE]: 'Congé maternité',
      [TypeConge.PATERNITE]: 'Congé paternité',
      [TypeConge.SANS_SOLDE]: 'Congé sans solde',
      [TypeConge.AUTRE]: 'Autre'
    };
    return typeMap[apiType] || apiType;
  }

  private mapStatus(apiStatus: StatutDemandeConge): 'En Attente' | 'Acceptée' | 'Refusée' {
    const statusMap: { [key: string]: 'En Attente' | 'Acceptée' | 'Refusée' } = {
      [StatutDemandeConge.EN_ATTENTE]: 'En Attente',
      [StatutDemandeConge.ACCEPTEE]: 'Acceptée',
      [StatutDemandeConge.REFUSEE]: 'Refusée'
    };
    return statusMap[apiStatus] || 'En Attente';
  }

  private getManagerName(apiRequest: LeaveRequest): string {
    if (apiRequest.validateurNom && apiRequest.validateurPrenom) {
      return `${apiRequest.validateurPrenom} ${apiRequest.validateurNom}`.trim();
    } else if (apiRequest.validateurNom) {
      return apiRequest.validateurNom;
    }
    return 'Non assigné';
  }

  private getStatusClass(status: string): string {
    switch (status) {
      case 'En Attente': return 'status-pending';
      case 'Acceptée': return 'status-approved';
      case 'Refusée': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'En Attente': return 'fas fa-hourglass-half';
      case 'Acceptée': return 'fas fa-check-circle';
      case 'Refusée': return 'fas fa-times-circle';
      default: return 'fas fa-hourglass-half';
    }
  }

  private loadMockData(): void {
    // Fallback mock data for development
    this.leaveRequests = [
      {
        id: '1',
        leaveType: 'Congé payé',
        startDate: new Date('2025-07-15'),
        endDate: new Date('2025-07-19'),
        totalDays: 5,
        reason: 'Vacances d\'été en famille',
        status: 'En Attente',
        submittedDate: new Date('2025-06-20'),
        statusClass: 'status-pending',
        statusIcon: 'fas fa-hourglass-half',
        managerName: 'Non assigné'
      },
      {
        id: '2',
        leaveType: 'Congé maladie',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-12'),
        totalDays: 3,
        reason: 'Grippe saisonnière',
        status: 'Acceptée',
        submittedDate: new Date('2025-06-09'),
        validationDate: new Date('2025-06-09'),
        managerNotes: 'Approuvé rapidement pour raisons médicales',
        managerName: 'Marie Dupont',
        statusClass: 'status-approved',
        statusIcon: 'fas fa-check-circle'
      },
      {
        id: '3',
        leaveType: 'Congé payé',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-01'),
        totalDays: 1,
        reason: 'Pont du 1er mai',
        status: 'Refusée',
        submittedDate: new Date('2025-04-25'),
        validationDate: new Date('2025-04-26'),
        managerNotes: 'Trop de demandes pour cette période, déjà plusieurs personnes en congé',
        managerName: 'Marie Dupont',
        statusClass: 'status-rejected',
        statusIcon: 'fas fa-times-circle'
      }
    ];
    
    this.filterRequests();
  }

  filterRequests(): void {
    this.filteredRequests = this.leaveRequests.filter(request => {
      const statusMatch = this.selectedStatus === 'all' || request.status === this.selectedStatus;
      const typeMatch = this.selectedType === 'all' || request.leaveType === this.selectedType;
      return statusMatch && typeMatch;
    });
  }

  onStatusFilterChange(): void {
    this.filterRequests();
  }

  onTypeFilterChange(): void {
    this.filterRequests();
  }

  formatDateRange(startDate: Date, endDate: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short' 
    };
    
    if (startDate.getTime() === endDate.getTime()) {
      return startDate.toLocaleDateString('fr-FR', { ...options, year: 'numeric' });
    }
    
    return `${startDate.toLocaleDateString('fr-FR', options)} - ${endDate.toLocaleDateString('fr-FR', options)}`;
  }

  getLeaveTypeColor(leaveType: string): string {
    switch (leaveType) {
      case 'Congé payé': return '#3498db';
      case 'Congé maladie': return '#e74c3c';
      case 'Congé maternité': return '#9b59b6';
      case 'Congé paternité': return '#1abc9c';
      case 'Congé sans solde': return '#f39c12';
      case 'Autre': return '#95a5a6';
      default: return '#95a5a6';
    }
  }

  // Statistics methods
  getPendingCount(): number {
    return this.leaveRequests.filter(r => r.status === 'En Attente').length;
  }

  getApprovedCount(): number {
    return this.leaveRequests.filter(r => r.status === 'Acceptée').length;
  }

  getRejectedCount(): number {
    return this.leaveRequests.filter(r => r.status === 'Refusée').length;
  }

  getTotalDays(): number {
    return this.leaveRequests
      .filter(r => r.status === 'Acceptée')
      .reduce((total, request) => total + request.totalDays, 0);
  }

  refreshData(): void {
    this.loadMyLeaveRequests();
  }

  goToRequestForm(): void {
    this.router.navigate(['/team-member/request-leave']);
  }
}
