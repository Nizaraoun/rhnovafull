import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveManagementService, CreateLeaveRequest, TypeConge } from '../../hr/leave-management/leave-management.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-request-leave-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './request-leave-form.component.html',
  styleUrls: ['./request-leave-form.component.scss']
})
export class RequestLeaveFormComponent implements OnInit {
  leaveRequestForm: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';
  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private leaveManagementService: LeaveManagementService
  ) {
    this.leaveRequestForm = this.fb.group({
      leaveType: ['', [Validators.required]], // Must match TypeConge enum values
      startDate: ['', [Validators.required]], // Will be converted to LocalDate format
      endDate: ['', [Validators.required]], // Will be converted to LocalDate format  
      reason: ['', [Validators.required, Validators.minLength(5)]], // Maps to 'raison' in DTO
      priority: ['normal'], // UI only, not sent to backend
      managerNotes: [''] // UI only, not sent to backend (commentaireValidateur is set by manager)
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  get totalDays(): number {
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    const endDate = this.leaveRequestForm.get('endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      return daysDiff > 0 ? daysDiff : 0;
    }
    
    return 0;
  }  getLeaveTypeLabel(): string {
    const leaveType = this.leaveRequestForm.get('leaveType')?.value;    const types: { [key: string]: string } = {
      [TypeConge.VACANCES]: 'Congé payé',
      [TypeConge.MALADIE]: 'Congé maladie',
      [TypeConge.MATERNITE]: 'Congé maternité',
      [TypeConge.PATERNITE]: 'Congé paternité',
      [TypeConge.SANS_SOLDE]: 'Congé sans solde',
      [TypeConge.AUTRE]: 'Autre'
    };
    return types[leaveType] || '';
  }

  formatDateRange(): string {
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    const endDate = this.leaveRequestForm.get('endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
    }
    
    return '';
  }  onSubmit(): void {
    if (this.leaveRequestForm.valid) {
      this.isSubmitting = true;
      this.showErrorMessage = false;
      
      // Map form data to API format matching DemandeCongedto
      const formValues = this.leaveRequestForm.value;
      const leaveRequest: CreateLeaveRequest = {
        employeId: this.getCurrentEmployeeId(), // Include employeId as required by DTO
        dateDebut: formValues.startDate,
        dateFin: formValues.endDate,
        typeConge: formValues.leaveType as TypeConge,
        raison: formValues.reason
      };

      this.leaveManagementService.createTeamMemberLeaveRequest(leaveRequest)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (response) => {
            console.log('Leave request created successfully:', response);
            this.showSuccessMessage = true;
            
            // Reset form and redirect after success
            setTimeout(() => {
              this.router.navigate(['/team-member/dashboard']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error creating leave request:', error);
            this.errorMessage = 'Erreur lors de la soumission de la demande. Veuillez réessayer.';
            this.showErrorMessage = true;
          }
        });
    }
  }  private getCurrentEmployeeId(): string {
    // Get current user data from localStorage (set by AuthService)
    if (typeof localStorage !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Return the user ID which should match employeId in the DTO
          return user.id || user.employeId || 'current-user';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    
    // Fallback for development/testing - in production this should come from auth service
    console.warn('Using fallback employee ID. Ensure proper authentication is implemented.');
    return 'current-user';
  }

  onCancel(): void {
    this.router.navigate(['/team-member/dashboard']);
  }
}
