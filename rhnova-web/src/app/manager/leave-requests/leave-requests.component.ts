import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveManagementService, LeaveRequest as ApiLeaveRequest, TypeConge, StatutDemandeConge } from '../../hr/leave-management/leave-management.service';
import { finalize } from 'rxjs/operators';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeAvatar: string;
  team: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: Date;
  priority: 'Normal' | 'Urgent';
  managerNotes?: string;
  originalData?: ApiLeaveRequest;
}

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss']
})
export class LeaveRequestsComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  selectedStatus = 'all';
  selectedTeam = 'all';
  isLoading = false;
  error: string | null = null;
  
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'Pending', label: 'En attente' },
    { value: 'Approved', label: 'Approuvé' },
    { value: 'Rejected', label: 'Rejeté' }
  ];

  constructor(private leaveManagementService: LeaveManagementService) {}
  ngOnInit(): void {
    this.loadLeaveRequests();
  }
  loadLeaveRequests(): void {
    this.isLoading = true;
    this.error = null;
    
    // Use the manager-specific endpoint for team requests
    this.leaveManagementService.getTeamLeaveRequests()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (apiRequests: ApiLeaveRequest[]) => {
          this.leaveRequests = this.transformApiDataToDisplayFormat(apiRequests);
          this.filterRequests();
        },        error: (error: any) => {
          console.error('Error loading leave requests:', error);
          this.error = 'Erreur lors du chargement des demandes de congé';
          // Fallback to mock data for development
          this.loadMockData();
        }
      });
  }
  private transformApiDataToDisplayFormat(apiRequests: ApiLeaveRequest[]): LeaveRequest[] {
    return apiRequests.map(apiRequest => ({
      id: apiRequest.id,
      // Handle null values for names
      employeeName: `${apiRequest.employePrenom || ''} ${apiRequest.employeNom || ''}`.trim() || 'Nom inconnu',
      employeeAvatar: '/assets/images/default-avatar.png',
      team: this.getEmployeeTeam(apiRequest.employeId || ''),
      leaveType: this.mapLeaveType(apiRequest.typeConge),
      startDate: new Date(apiRequest.dateDebut),
      endDate: new Date(apiRequest.dateFin),
      totalDays: apiRequest.nombreJours,
      reason: apiRequest.raison || 'Aucune raison spécifiée',
      status: this.mapStatus(apiRequest.statut),
      submittedDate: new Date(apiRequest.dateCreation),
      priority: this.determinePriority(apiRequest),
      managerNotes: apiRequest.commentaireValidateur || undefined,
      originalData: apiRequest
    }));
  }private mapLeaveType(apiType: TypeConge): string {    const typeMap: { [key: string]: string } = {
      [TypeConge.VACANCES]: 'Congé payé',
      [TypeConge.MALADIE]: 'Congé maladie',
      [TypeConge.MATERNITE]: 'Congé maternité',
      [TypeConge.PATERNITE]: 'Congé paternité',
      [TypeConge.SANS_SOLDE]: 'Congé sans solde',
      [TypeConge.AUTRE]: 'Autre'
    };
    return typeMap[apiType] || apiType;
  }
  private mapStatus(apiStatus: StatutDemandeConge): 'Pending' | 'Approved' | 'Rejected' {
    const statusMap: { [key: string]: 'Pending' | 'Approved' | 'Rejected' } = {
      [StatutDemandeConge.EN_ATTENTE]: 'Pending',
      [StatutDemandeConge.ACCEPTEE]: 'Approved',
      [StatutDemandeConge.REFUSEE]: 'Rejected'
    };
    return statusMap[apiStatus] || 'Pending';
  }

  private determinePriority(apiRequest: ApiLeaveRequest): 'Normal' | 'Urgent' {
    // Determine priority based on leave type or other criteria
    if (apiRequest.typeConge === TypeConge.MALADIE) {
      return 'Urgent';
    }
    // Check if start date is soon (within 7 days)
    const startDate = new Date(apiRequest.dateDebut);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 ? 'Urgent' : 'Normal';
  }
  private getEmployeeTeam(employeeId: string): string {
    // TODO: Implement team lookup service or get from employee data
    // For now, return a default team based on employee ID pattern or mock data
    const teams = ['Développement', 'Marketing', 'RH', 'Finance', 'Support'];
    
    // Simple hash function to assign consistent teams
    let hash = 0;
    for (let i = 0; i < employeeId.length; i++) {
      const char = employeeId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return teams[Math.abs(hash) % teams.length];
  }

  private loadMockData(): void {
    // Fallback mock data
    this.leaveRequests = [
      {
        id: '1',
        employeeName: 'Sarah Martin',
        employeeAvatar: '/assets/images/default-avatar.png',
        team: 'Développement',        leaveType: 'Congé payé',
        startDate: new Date('2025-07-15'),
        endDate: new Date('2025-07-19'),
        totalDays: 5,
        reason: 'Vacances en famille prévues depuis longtemps',
        status: 'Pending',
        submittedDate: new Date('2024-01-20'),
        priority: 'Normal'
      },
      {
        id: '2',
        employeeName: 'Ahmed Ben Ali',
        employeeAvatar: '/assets/images/default-avatar.png',
        team: 'Développement',        leaveType: 'Congé maladie',
        startDate: new Date('2025-06-26'),
        endDate: new Date('2025-06-28'),
        totalDays: 3,
        reason: 'Grippe saisonnière nécessitant repos médical',
        status: 'Approved',
        submittedDate: new Date('2024-02-04'),
        priority: 'Urgent',
        managerNotes: 'Approuvé rapidement pour raisons médicales'
      },
      {
        id: '3',
        employeeName: 'Emma Dubois',
        employeeAvatar: '/assets/images/default-avatar.png',
        team: 'Développement',
        leaveType: 'Congé personnel',
        startDate: new Date('2024-02-20'),
        endDate: new Date('2024-02-20'),
        totalDays: 1,
        reason: 'Rendez-vous médical important',
        status: 'Pending',
        submittedDate: new Date('2024-01-25'),
        priority: 'Normal'
      },
      {
        id: '4',
        employeeName: 'Léa Moreau',
        employeeAvatar: '/assets/images/default-avatar.png',
        team: 'Marketing',
        leaveType: 'Congé payé',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-10'),
        totalDays: 8,
        reason: 'Voyage de noces',
        status: 'Pending',
        submittedDate: new Date('2024-01-30'),
        priority: 'Normal'
      }
    ];
    
    this.filterRequests();
  }

  filterRequests(): void {
    this.filteredRequests = this.leaveRequests.filter(request => {
      const statusMatch = this.selectedStatus === 'all' || request.status === this.selectedStatus;
      const teamMatch = this.selectedTeam === 'all' || request.team === this.selectedTeam;
      return statusMatch && teamMatch;
    });
  }

  onStatusFilterChange(): void {
    this.filterRequests();
  }

  onTeamFilterChange(): void {
    this.filterRequests();
  }  approveRequest(request: LeaveRequest): void {
    if (!request.originalData) {
      console.error('No original API data found for request');
      return;
    }

    const comments = 'Demande approuvée';
    this.leaveManagementService.approveTeamMemberRequest(request.id, comments)
      .subscribe({
        next: () => {
          request.status = 'Approved';
          request.managerNotes = comments;
          console.log('Approved request:', request);
          // Optionally reload data to get updated info from server
          this.loadLeaveRequests();
        },
        error: (error: any) => {
          console.error('Error approving request:', error);
          this.error = 'Erreur lors de l\'approbation de la demande';
        }
      });
  }

  rejectRequest(request: LeaveRequest): void {
    if (!request.originalData) {
      console.error('No original API data found for request');
      return;
    }

    const reason = prompt('Raison du refus (obligatoire):');
    if (!reason || reason.trim() === '') {
      alert('La raison du refus est obligatoire');
      return;
    }
    
    this.leaveManagementService.rejectTeamMemberRequest(request.id, reason)
      .subscribe({
        next: () => {
          request.status = 'Rejected';
          request.managerNotes = reason;
          console.log('Rejected request:', request);
          // Optionally reload data to get updated info from server
          this.loadLeaveRequests();
        },
        error: (error: any) => {
          console.error('Error rejecting request:', error);
          this.error = 'Erreur lors du refus de la demande';
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    return priority === 'Urgent' ? 'priority-urgent' : 'priority-normal';
  }

  getLeaveTypeColor(leaveType: string): string {
    switch (leaveType) {
      case 'Congé payé': return '#3498db';
      case 'Congé maladie': return '#e74c3c';
      case 'Congé personnel': return '#f39c12';
      case 'Congé maternité': return '#9b59b6';
      case 'Congé paternité': return '#1abc9c';
      default: return '#95a5a6';
    }
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

  getTeams(): string[] {
    const teams = new Set(this.leaveRequests.map(r => r.team));
    return Array.from(teams);
  }

  getPendingCount(): number {
    return this.leaveRequests.filter(r => r.status === 'Pending').length;
  }
  getUrgentCount(): number {
    return this.leaveRequests.filter(r => r.priority === 'Urgent' && r.status === 'Pending').length;
  }

  getApprovedCount(): number {
    return this.leaveRequests.filter(r => r.status === 'Approved').length;
  }

  getRejectedCount(): number {
    return this.leaveRequests.filter(r => r.status === 'Rejected').length;
  }

  getTotalDays(): number {
    return this.leaveRequests.reduce((total, request) => total + request.totalDays, 0);
  }

  refreshData(): void {
    this.loadLeaveRequests();
  }
}
