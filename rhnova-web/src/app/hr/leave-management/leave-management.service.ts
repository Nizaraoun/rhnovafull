import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { BaseHttpService } from '../../shared/services/base-http.service';

export interface LeaveRequest {
  id: string;
  employe: {
    id: string;
    name: string;
    email: string;
    role: string;
    equipe?: any;
  };
  validateur?: {
    id: string;
    name: string;
    email: string;
    role: string;
    equipe?: any;
  };
  dateDebut: string; // LocalDate as ISO string
  dateFin: string; // LocalDate as ISO string
  typeConge: TypeConge;
  statut: StatutDemandeConge;
  raison: string;
  nombreJours: number;
  dateCreation: string; // LocalDate as ISO string
  dateValidation?: string; // LocalDate as ISO string, optional
  commentaireValidateur?: string;
  
  // Legacy fields for backward compatibility
  employeId?: string;
  employeNom?: string;
  employePrenom?: string;
  validateurId?: string;
  validateurNom?: string;
  validateurPrenom?: string;
}

export interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  currentMonthRequests: number;
  requestsByType: {
    [key: string]: number;
  };
}

export interface CreateLeaveRequest {
  employeId: string;
  dateDebut: string; // LocalDate as ISO string (YYYY-MM-DD)
  dateFin: string; // LocalDate as ISO string (YYYY-MM-DD)
  typeConge: TypeConge;
  raison: string;
}

export interface UpdateLeaveRequest {
  dateDebut?: string; // LocalDate as ISO string
  dateFin?: string; // LocalDate as ISO string
  typeConge?: TypeConge;
  raison?: string;
  commentaireValidateur?: string;
}

// Enums matching your Java backend exactly
export enum TypeConge {
  VACANCES = 'VACANCES',
  MALADIE = 'MALADIE',
  MATERNITE = 'MATERNITE',
  PATERNITE = 'PATERNITE',
  SANS_SOLDE = 'SANS_SOLDE',
  AUTRE = 'AUTRE'
}

export enum StatutDemandeConge {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}

/**
 * Leave Management Service
 * 
 * This service integrates with the Spring Boot backend HR Leave Management API.
 * 
 * Supported Backend Endpoints:
 * - GET /api/hr/conges - Get all leave requests
 * - GET /api/hr/conges/{id} - Get specific leave request
 * - POST /api/hr/conges - Create new leave request
 * - PUT /api/hr/conges/{id} - Update leave request
 * - DELETE /api/hr/conges/{id} - Delete leave request
 * - PUT /api/hr/conges/{id}/approve - Approve leave request
 * - PUT /api/hr/conges/{id}/reject - Reject leave request
 * - GET /api/hr/conges/employee/{employeeId} - Get employee's leave requests
 * - GET /api/hr/conges/stats - Get leave statistics
 * 
 * Note: Some methods like filtering by status/type are implemented client-side
 * since the backend doesn't expose specific endpoints for these operations.
 */
@Injectable({
  providedIn: 'root'
})
export class LeaveManagementService extends BaseHttpService {
  private readonly apiUrl = '/api/conges'; // Updated to match the new API documentation
    constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get all leave requests - matches GET /hr/conges
   */
getAllLeaveRequests(): Observable<LeaveRequest[]> {

  console.log('Making authenticated API call to:', `${this.apiUrl}/all`);
  return this.get<LeaveRequest[]>(`${this.apiUrl}/all`).pipe(
    catchError((error) => {
      console.error('API call failed:', error);
      console.error('Response status:', error.status);
      console.error('Response URL:', error.url);
      console.error('Response body:', error.error);
      
      if (error.status === 401) {
        console.error('Authentication failed. Token may be expired or invalid.');
      }
      
      console.log('Returning empty array due to API error');
      return of([]);
    })
  );
}  /**
   * Get a specific leave request by ID - matches GET /hr/conges/{id}
   */
  getLeaveRequestById(id: string): Observable<LeaveRequest> {
    return this.get<LeaveRequest>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of({} as LeaveRequest))
    );
  }

  /**
   * Create a new leave request - matches POST /hr/conges
   */
  createLeaveRequest(requestData: CreateLeaveRequest): Observable<LeaveRequest> {
    return this.post<LeaveRequest>(`${this.apiUrl}`, requestData).pipe(
      catchError(() => of({} as LeaveRequest))
    );
  }

  /**
   * Update a leave request - matches PUT /hr/conges/{id}
   */
  updateLeaveRequest(id: string, requestData: UpdateLeaveRequest): Observable<LeaveRequest> {
    return this.put<LeaveRequest>(`${this.apiUrl}/${id}`, requestData).pipe(
      catchError(() => of({} as LeaveRequest))
    );
  }

  /**
   * Delete a leave request - matches DELETE /hr/conges/{id}
   */
  deleteLeaveRequest(id: string): Observable<any> {
    return this.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(null))
    );
  }
  /**
   * Approve a leave request - matches PUT /hr/conges/{id}/approve
   */
  approveLeaveRequest(id: string, comments?: string): Observable<any> {
    const body = comments ? { commentaireValidateur: comments } : null;
    return this.put(`${this.apiUrl}/${id}/approve`, body).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Reject a leave request - matches PUT /hr/conges/{id}/reject
   */
  rejectLeaveRequest(id: string, comments?: string): Observable<any> {
    const body = comments ? { commentaireValidateur: comments } : null;
    return this.put(`${this.apiUrl}/${id}/reject`, body).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Get leave requests for a specific employee - matches GET /hr/conges/employee/{employeeId}
   */
  getEmployeeLeaveRequests(employeeId: string): Observable<LeaveRequest[]> {
    return this.get<LeaveRequest[]>(`${this.apiUrl}/employee/${employeeId}`).pipe(
      catchError(() => of([]))
    );
  }
  /**
   * Get leave statistics - matches GET /hr/conges/stats
   */
  getLeaveStats(): Observable<LeaveStats> {
    return this.get<LeaveStats>(`${this.apiUrl}/stats`).pipe(
      catchError(() => of({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        currentMonthRequests: 0,
        requestsByType: {}
      }))
    );
  }

  // Helper methods for client-side filtering (since backend doesn't have specific endpoints)
  /**
   * Get pending leave requests (filtered client-side)
   */
  getPendingLeaveRequests(): Observable<LeaveRequest[]> {    return this.getAllLeaveRequests().pipe(
      map((requests: LeaveRequest[]) => requests.filter((request: LeaveRequest) => 
        request.statut === StatutDemandeConge.EN_ATTENTE
      ))
    );
  }
  /**
   * Get leave requests by status (filtered client-side)
   */
  getLeaveRequestsByStatus(status: StatutDemandeConge): Observable<LeaveRequest[]> {
    return this.getAllLeaveRequests().pipe(
      map((requests: LeaveRequest[]) => requests.filter((request: LeaveRequest) => request.statut === status))
    );
  }

  /**
   * Get leave requests by type (filtered client-side)
   */
  getLeaveRequestsByType(type: TypeConge): Observable<LeaveRequest[]> {
    return this.getAllLeaveRequests().pipe(
      map((requests: LeaveRequest[]) => requests.filter((request: LeaveRequest) => request.typeConge === type))
    );
  }

  /**
   * Get leave requests by date range (filtered client-side)
   */
  getLeaveRequestsByDateRange(startDate: string, endDate: string): Observable<LeaveRequest[]> {
    return this.getAllLeaveRequests().pipe(
      map((requests: LeaveRequest[]) => requests.filter((request: LeaveRequest) => {
        const requestStart = new Date(request.dateDebut);
        const requestEnd = new Date(request.dateFin);
        const filterStart = new Date(startDate);
        const filterEnd = new Date(endDate);
        
        return (requestStart >= filterStart && requestStart <= filterEnd) ||
               (requestEnd >= filterStart && requestEnd <= filterEnd) ||
               (requestStart <= filterStart && requestEnd >= filterEnd);
      }))
    );
  }
  /**
   * Get leave type label for display
   * @param type - Leave type from API
   */  getLeaveTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {      [TypeConge.VACANCES]: 'Congé Payé',
      [TypeConge.MALADIE]: 'Congé Maladie',
      [TypeConge.MATERNITE]: 'Congé Maternité',
      [TypeConge.PATERNITE]: 'Congé Paternité',
      [TypeConge.SANS_SOLDE]: 'Congé Sans Solde',
      [TypeConge.AUTRE]: 'Autre'
    };
    return labels[type] || type;
  }
  /**
   * Get status label for display
   * @param status - Status from API
   */  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      [StatutDemandeConge.EN_ATTENTE]: 'En Attente',
      [StatutDemandeConge.ACCEPTEE]: 'Acceptée',
      [StatutDemandeConge.REFUSEE]: 'Refusée'
    };
    return labels[status] || status;
  }

  /**
   * Transform API data to display format
   * @param apiData - Raw API data
   */  transformApiData(apiData: LeaveRequest[]): any[] {
    return apiData.map(request => {
      // Extract employee information from nested object or legacy fields
      const employeeName = request.employe?.name || 
                          `${request.employeNom || ''} ${request.employePrenom || ''}`.trim() ||
                          'Unknown Employee';
      
      const employeeId = request.employe?.id || request.employeId || '';
      
      // Extract validator information from nested object or legacy fields  
      const validatorName = request.validateur?.name ||
                           `${request.validateurNom || ''} ${request.validateurPrenom || ''}`.trim() ||
                           undefined;
      
      const validatorId = request.validateur?.id || request.validateurId || undefined;
      
      return {
        ...request,
        // Transform API data to component format
        employeeName: employeeName,
        employeeId: employeeId,
        employeeAvatar: 'assets/images/default-avatar.png',
        department: 'Unknown', // You might need to fetch this separately or get from equipe
        leaveType: request.typeConge?.toLowerCase() || '',
        startDate: new Date(request.dateDebut),
        endDate: new Date(request.dateFin),
        totalDays: request.nombreJours,
        status: this.transformStatus(request.statut),
        reason: request.raison,
        appliedDate: new Date(request.dateCreation),
        approvedBy: validatorName,
        approvedDate: request.dateValidation ? new Date(request.dateValidation) : undefined,
        rejectionReason: request.commentaireValidateur,
        
        // Also add the extracted names to the legacy fields for backward compatibility
        employeNom: request.employe?.name?.split(' ')[0] || request.employeNom,
        employePrenom: request.employe?.name?.split(' ').slice(1).join(' ') || request.employePrenom,
        validateurNom: request.validateur?.name?.split(' ')[0] || request.validateurNom,
        validateurPrenom: request.validateur?.name?.split(' ').slice(1).join(' ') || request.validateurPrenom
      };
    });
  }
  /**
   * Transform API status to display format
   * @param status - API status
   */  private transformStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      [StatutDemandeConge.EN_ATTENTE]: 'pending',
      [StatutDemandeConge.ACCEPTEE]: 'approved',
      [StatutDemandeConge.REFUSEE]: 'rejected'
    };
    return statusMap[status] || status.toLowerCase();
  }

  /**
   * Generate CSV data for export
   * @param requests - Leave requests to export
   */
  generateCSV(requests: LeaveRequest[]): string {
    const headers = [
      'Employee Name',
      'Employee ID', 
      'Leave Type',
      'Start Date',
      'End Date',
      'Total Days',
      'Status',
      'Reason',
      'Applied Date',
      'Validator',
      'Validation Date',
      'Comments'
    ];    const rows = requests.map(request => [
      request.employe?.name || `${request.employeNom || ''} ${request.employePrenom || ''}`.trim(),
      request.employe?.id || request.employeId || '',
      this.getLeaveTypeLabel(request.typeConge),
      request.dateDebut,
      request.dateFin,
      request.nombreJours.toString(),
      this.getStatusLabel(request.statut),
      request.raison,
      request.dateCreation,
      request.validateur?.name || request.validateurNom || '',
      request.dateValidation || '',
      request.commentaireValidateur || ''
    ]);    const csvArray = [headers, ...rows];
    return csvArray.map(row => 
      row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Download CSV file
   * @param csvContent - CSV content
   * @param filename - File name
   */
  downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
  /**
   * Handle HTTP operation that failed - uses base class error handling
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleApiError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log error details for debugging
      if (error.error) {
        console.error('Error details:', error.error);
      }
      
      // Return empty result to keep app running
      return of(result as T);
    };
  }

  /**
   * Get current HR user ID (replace with actual implementation)
   */
  getCurrentHrUserId(): string {
    // TODO: Implement actual user service integration
    return 'current-hr-user-id';
  }

  /**
   * Validate leave request dates
   * @param startDate - Start date
   * @param endDate - End date
   */
  validateLeaveDates(startDate: string, endDate: string): { valid: boolean; message?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (start > end) {
      return { valid: false, message: 'Start date cannot be after end date' };
    }
    
    if (start < today) {
      return { valid: false, message: 'Start date cannot be in the past' };
    }
    
    return { valid: true };
  }
  /**
   * Calculate number of days between dates
   * @param startDate - Start date
   * @param endDate - End date
   */
  calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  } 

  // Manager-specific endpoints

  /**
   * Create manager leave request - matches POST /api/conges/manager/create
   */
  createManagerLeaveRequest(requestData: Omit<CreateLeaveRequest, 'employeId'>): Observable<LeaveRequest> {
    return this.post<LeaveRequest>(`${this.apiUrl}/manager/create`, requestData).pipe(
      catchError(() => of({} as LeaveRequest))
    );
  }

  /**
   * Get manager's own leave requests - matches GET /api/conges/manager/my-requests
   */
  getManagerOwnRequests(): Observable<LeaveRequest[]> {
    return this.get<LeaveRequest[]>(`${this.apiUrl}/manager/my-requests`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get team leave requests - matches GET /api/conges/manager/team-requests
   */
  getTeamLeaveRequests(): Observable<LeaveRequest[]> {
    return this.get<LeaveRequest[]>(`${this.apiUrl}/manager/team-requests`).pipe(
      catchError(() => of([]))
    );
  }  /**
   * Approve team member leave request - matches PATCH /api/conges/manager/{leaveId}/approve
   */
  approveTeamMemberRequest(leaveId: string, comments?: string): Observable<LeaveRequest> {
    const endpoint = `${this.apiUrl}/manager/${leaveId}/approve`;
    if (comments) {
      return this.patchWithParams<LeaveRequest>(endpoint, null, { comments });
    } else {
      return this.patch<LeaveRequest>(endpoint, null);
    }
  }

  /**
   * Reject team member leave request - matches PATCH /api/conges/manager/{leaveId}/reject
   */
  rejectTeamMemberRequest(leaveId: string, comments: string): Observable<LeaveRequest> {
    const endpoint = `${this.apiUrl}/manager/${leaveId}/reject`;
    return this.patchWithParams<LeaveRequest>(endpoint, null, { comments });
  }

  /**
   * Helper method for PATCH requests with query parameters
   */
  private patchWithParams<T>(endpoint: string, body: any, params: any): Observable<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    
    console.log(`PATCH ${fullUrl}`, body, { params });
    
    return this.http.patch<T>(fullUrl, body, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      catchError((error: any): Observable<T> => {
        console.error('PATCH request failed:', error);
        return of({} as T);
      })
    );
  }

  // Team member-specific endpoints

  /**
   * Get team member's own leave requests - matches GET /api/conges/member/my-requests
   */
  getMyLeaveRequests(): Observable<LeaveRequest[]> {
    return this.get<LeaveRequest[]>(`${this.apiUrl}/member/my-requests`).pipe(
      catchError(() => of([]))
    );
  }
  /**
   * Create team member leave request - matches POST /api/conges/member/create
   */
  createTeamMemberLeaveRequest(requestData: Omit<CreateLeaveRequest, 'employeId'>): Observable<LeaveRequest> {
    return this.post<LeaveRequest>(`${this.apiUrl}/member/create`, requestData).pipe(
      catchError(() => of({} as LeaveRequest))
    );
  }

  /**
   * Get team leave calendar - matches GET /api/conges/member/team-calendar
   */
  getTeamLeaveCalendar(): Observable<LeaveRequest[]> {
    return this.get<LeaveRequest[]>(`${this.apiUrl}/member/team-calendar`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Update my leave request - matches PUT /api/conges/member/{leaveId}/update
   */
  updateMyLeaveRequest(leaveId: string, requestData: UpdateLeaveRequest): Observable<LeaveRequest> {
    return this.put<LeaveRequest>(`${this.apiUrl}/member/${leaveId}/update`, requestData).pipe(
      catchError(() => of({} as LeaveRequest))
    );
  }

  /**
   * Cancel my leave request - matches DELETE /api/conges/member/{leaveId}/cancel
   */
  cancelMyLeaveRequest(leaveId: string): Observable<any> {
    return this.delete(`${this.apiUrl}/member/${leaveId}/cancel`).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Get leave request details - matches GET /api/conges/details/{leaveId}
   */
  getLeaveRequestDetails(leaveId: string): Observable<LeaveRequest> {
    return this.get<LeaveRequest>(`${this.apiUrl}/details/${leaveId}`).pipe(
      catchError(() => of({} as LeaveRequest))
    );
  }
}
