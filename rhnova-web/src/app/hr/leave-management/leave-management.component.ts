import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  LeaveManagementService, 
  LeaveRequest as ApiLeaveRequest, 
  LeaveStats as ApiLeaveStats,
  UpdateLeaveRequest,
  TypeConge,
  StatutDemandeConge
} from './leave-management.service';

interface DisplayLeaveRequest extends ApiLeaveRequest {
  // Additional computed properties for display
  employeeName?: string;
  employeeId?: string;
  employeeAvatar?: string;
  department?: string;
  leaveType?: string;
  startDate?: Date;
  endDate?: Date;
  totalDays?: number;
  status?: string;
  reason?: string;
  appliedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  rejectedBy?: string;
  rejectedDate?: Date;
  rejectionReason?: string;
}

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.scss']
})
export class LeaveManagementComponent implements OnInit {
  // Component properties
  leaveRequests: DisplayLeaveRequest[] = [];
  filteredLeaveRequests: DisplayLeaveRequest[] = [];
  
  // Stats
  pendingRequests = 0;
  approvedRequests = 0;
  rejectedRequests = 0;
  totalLeaveDays = 0;
  
  // Filters
  searchTerm = '';
  selectedStatus: '' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' = '';
  selectedLeaveType: '' | 'VACANCES' | 'MALADIE' | 'MATERNITE' | 'PATERNITE' | 'SANS_SOLDE' | 'AUTRE' = '';
  dateFilter = '';
  
  // View mode
  viewMode: 'table' | 'card' = 'table';
  
  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
    // Loading state
  isLoading = false;
  
  // Action states
  processingRequests = new Set<string>(); // Track which requests are being processed
  
  // Feedback messages
  successMessage = '';
  errorMessage = '';
  showSuccessMessage = false;
  showErrorMessage = false;
    // Modal states
  showApprovalModal = false;
  showRejectionModal = false;
  showEditModal = false;
  selectedRequest: DisplayLeaveRequest | null = null;
  approvalComments = '';
  rejectionComments = '';
  
  // Edit form data
  editForm = {
    dateDebut: '',
    dateFin: '',
    typeConge: '',
    raison: '',
    commentaireValidateur: ''
  };
    // Math reference for template
  Math = Math;

  // Inject the service using the inject function
  private leaveService = inject(LeaveManagementService);  ngOnInit() {
    // Debug JWT token
    
    // Test API connectivity first
    
    this.loadLeaveRequests();
    // this.loadStats();
  }

  loadLeaveRequests() {
    this.isLoading = true;
    
    this.leaveService.getAllLeaveRequests().subscribe({
      next: (requests) => {
        this.leaveRequests = this.leaveService.transformApiData(requests);
        this.filteredLeaveRequests = [...this.leaveRequests];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
        this.isLoading = false;
        // Fallback to empty data on error
        this.leaveRequests = [];
        this.filteredLeaveRequests = [];
      }
    });
  }

  loadStats() {
    this.leaveService.getLeaveStats().subscribe({
      next: (stats) => {
        this.pendingRequests = stats.pendingRequests;
        this.approvedRequests = stats.approvedRequests;
        this.rejectedRequests = stats.rejectedRequests;
        this.totalLeaveDays = stats.totalRequests; // You might want to calculate actual days
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.updateStatsFromRequests();
      }
    });
  }

  updateStatsFromRequests() {
    this.pendingRequests = this.leaveRequests.filter(r => r.statut === 'EN_ATTENTE').length;
    this.approvedRequests = this.leaveRequests.filter(r => r.statut === 'ACCEPTEE').length;
    this.rejectedRequests = this.leaveRequests.filter(r => r.statut === 'REFUSEE').length;
    this.totalLeaveDays = this.leaveRequests
      .filter(r => r.statut === 'ACCEPTEE')
      .reduce((sum, r) => sum + r.nombreJours, 0);
  }

  filterLeaveRequests() {
    let filtered = [...this.leaveRequests];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.employeNom?.toLowerCase().includes(term) ||
        request.employePrenom?.toLowerCase().includes(term) ||
        request.raison?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(request => request.statut === this.selectedStatus);
    }

    // Leave type filter
    if (this.selectedLeaveType) {
      filtered = filtered.filter(request => request.typeConge === this.selectedLeaveType);
    }

    // Date filter
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(request => {
        const startDate = new Date(request.dateDebut);
        const endDate = new Date(request.dateFin);
        return startDate <= filterDate && endDate >= filterDate;
      });
    }

    this.filteredLeaveRequests = this.leaveService.transformApiData(filtered);
    this.currentPage = 1;
    this.updatePagination();
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredLeaveRequests.sort((a, b) => {
      let aValue: any = a[field as keyof DisplayLeaveRequest];
      let bValue: any = b[field as keyof DisplayLeaveRequest];

      if (field === 'employeeName') {
        aValue = a.employeNom + ' ' + a.employePrenom;
        bValue = b.employeNom + ' ' + b.employePrenom;
      }

      if (field === 'startDate' || field === 'endDate') {
        aValue = new Date(field === 'startDate' ? a.dateDebut : a.dateFin).getTime();
        bValue = new Date(field === 'startDate' ? b.dateDebut : b.dateFin).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  setViewMode(mode: 'table' | 'card') {
    this.viewMode = mode;
  }

  updatePagination() {
    this.totalItems = this.filteredLeaveRequests.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Update filtered results for current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredLeaveRequests = this.filteredLeaveRequests.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterLeaveRequests();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
  getLeaveTypeLabel(type: string): string {
    return this.leaveService.getLeaveTypeLabel(type);
  }

  getEmployeeName(request: DisplayLeaveRequest | null): string {
    if (!request) return 'l\'employé';
    return request.employeeName || `${request.employeNom || ''} ${request.employePrenom || ''}`.trim() || 'l\'employé';
  }
  // Action methods
  viewRequest(request: DisplayLeaveRequest) {
    console.log('View request:', request);
    // Implement view modal/page logic
  }

  approveRequest(request: DisplayLeaveRequest) {
    this.selectedRequest = request;
    this.approvalComments = '';
    this.showApprovalModal = true;
  }

  rejectRequest(request: DisplayLeaveRequest) {
    this.selectedRequest = request;
    this.rejectionComments = '';
    this.showRejectionModal = true;
  }

  confirmApproval() {
    if (!this.selectedRequest) return;

    const requestId = this.selectedRequest.id;
    this.processingRequests.add(requestId);
    this.hideMessages();

    this.leaveService.approveLeaveRequest(requestId, this.approvalComments).subscribe({
      next: (response) => {
        // Update the request status in the UI immediately
        this.selectedRequest!.statut = 'ACCEPTEE' as any;
        this.selectedRequest!.status = 'approved';
        this.selectedRequest!.dateValidation = new Date().toISOString();
        this.selectedRequest!.commentaireValidateur = this.approvalComments;
          this.updateStatsFromRequests();
        this.processingRequests.delete(requestId);
        this.showApprovalModal = false;
        
        const employeeName = this.getEmployeeName(this.selectedRequest);
        this.selectedRequest = null;
        this.approvalComments = '';
        
        this.showSuccess(`Demande de congé approuvée avec succès pour ${employeeName}`);
        
        // Refresh data to ensure consistency
        this.loadLeaveRequests();
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.processingRequests.delete(requestId);
        this.showApprovalModal = false;
        this.showError('Erreur lors de l\'approbation de la demande. Veuillez réessayer.');
      }
    });
  }

  confirmRejection() {
    if (!this.selectedRequest || !this.rejectionComments.trim()) {
      this.showError('Un commentaire est requis pour rejeter une demande.');
      return;
    }

    const requestId = this.selectedRequest.id;
    this.processingRequests.add(requestId);
    this.hideMessages();

    this.leaveService.rejectLeaveRequest(requestId, this.rejectionComments).subscribe({
      next: (response) => {
        // Update the request status in the UI immediately
        this.selectedRequest!.statut = 'REFUSEE' as any;
        this.selectedRequest!.status = 'rejected';
        this.selectedRequest!.dateValidation = new Date().toISOString();
        this.selectedRequest!.commentaireValidateur = this.rejectionComments;
        
        this.updateStatsFromRequests();
        this.processingRequests.delete(requestId);
        this.showRejectionModal = false;
        
        const employeeName = this.getEmployeeName(this.selectedRequest);
        this.selectedRequest = null;
        this.rejectionComments = '';
        
        this.showSuccess(`Demande de congé rejetée pour ${employeeName}`);
        
        // Refresh data to ensure consistency
        this.loadLeaveRequests();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.processingRequests.delete(requestId);
        this.showRejectionModal = false;
        this.showError('Erreur lors du rejet de la demande. Veuillez réessayer.');
      }
    });
  }

  cancelApproval() {
    this.showApprovalModal = false;
    this.selectedRequest = null;
    this.approvalComments = '';
  }

  cancelRejection() {
    this.showRejectionModal = false;
    this.selectedRequest = null;
    this.rejectionComments = '';
  }

  isRequestProcessing(requestId: string): boolean {
    return this.processingRequests.has(requestId);
  }

  // Utility methods for feedback messages
  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessMessage = true;
    this.showErrorMessage = false;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideMessages();
    }, 5000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showErrorMessage = true;
    this.showSuccessMessage = false;
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      this.hideMessages();
    }, 8000);
  }

  hideMessages() {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.successMessage = '';
    this.errorMessage = '';
  }
  editRequest(request: DisplayLeaveRequest) {
    this.selectedRequest = request;
    
    // Populate edit form with current values
    this.editForm = {
      dateDebut: request.dateDebut || '',
      dateFin: request.dateFin || '',
      typeConge: request.typeConge || '',
      raison: request.raison || '',
      commentaireValidateur: request.commentaireValidateur || ''
    };
    
    this.showEditModal = true;
    console.log('Edit request opened:', request);
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedRequest = null;
    this.editForm = {
      dateDebut: '',
      dateFin: '',
      typeConge: '',
      raison: '',
      commentaireValidateur: ''
    };
  }

  saveEditChanges() {
    if (!this.selectedRequest) return;    const updatedRequest: UpdateLeaveRequest = {
      dateDebut: this.editForm.dateDebut,
      dateFin: this.editForm.dateFin,
      typeConge: this.editForm.typeConge as TypeConge,
      raison: this.editForm.raison,
      commentaireValidateur: this.editForm.commentaireValidateur
    };this.leaveService.updateLeaveRequest(this.selectedRequest.id, updatedRequest)
      .subscribe({
        next: (updatedLeaveRequest) => {
          console.log('Leave request updated successfully:', updatedLeaveRequest);
          this.successMessage = 'Demande de congé mise à jour avec succès';
          this.showSuccessMessage = true;
          this.loadLeaveRequests(); // Reload the data
          this.closeEditModal();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating leave request:', error);
          this.errorMessage = 'Erreur lors de la mise à jour de la demande de congé';
          this.showErrorMessage = true;
          
          // Clear error message after 5 seconds
          setTimeout(() => {
            this.showErrorMessage = false;
            this.errorMessage = '';
          }, 5000);
        }
      });
  }

  openNewLeaveModal() {
    console.log('Open new leave modal');
    // Implement new leave request modal
  }

  exportLeaveData() {
    console.log('Export leave data');
    const originalRequests = this.leaveRequests as ApiLeaveRequest[];
    const csvContent = this.leaveService.generateCSV(originalRequests);
    this.leaveService.downloadCSV(csvContent, 'leave-requests.csv');
  }

  isEditFormValid(): boolean {
    return !!(this.editForm.dateDebut && 
              this.editForm.dateFin && 
              this.editForm.typeConge &&              this.editForm.raison?.trim());
  }
}
