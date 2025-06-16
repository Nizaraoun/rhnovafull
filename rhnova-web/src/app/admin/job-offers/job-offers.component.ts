import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { JobOffer } from '../../shared/models/jobOffer';
import { JobOfferDisplay, JobOfferFilters } from '../../shared/models/jobOfferBackend';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-offers.component.html',
  styleUrls: ['./job-offers.component.scss']
})
export class JobOffersComponent implements OnInit {
  jobOffers: JobOfferDisplay[] = [];
  filteredJobOffers: JobOfferDisplay[] = [];
  searchForm: FormGroup;
  jobOfferForm: FormGroup;
  showJobOfferModal = false;
  editingJobOffer: JobOfferDisplay | null = null;
  loading = false;
  error = '';
  useMockData = false; // Flag to toggle between API and mock data

  departments = ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations'];
  types = ['full-time', 'part-time', 'contract'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      department: [''],
      status: [''],
      type: ['']
    });    this.jobOfferForm = this.fb.group({
      title: ['', Validators.required],
      department: ['', Validators.required],
      location: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      requirements: [''],
      salary: [''],
      deadline: ['', Validators.required],
      experience: [''] // Added for backend compatibility
    });
  }
  ngOnInit() {
    this.loadData(); // Use loadData instead of loadJobOffers directly
    this.setupSearchSubscription();
  }loadJobOffers() {
    this.loading = true;
    this.error = '';
    
    // Build filters from search form
    const filters: JobOfferFilters = {};
    const searchValue = this.searchForm.value;
    
    if (searchValue.searchTerm) {
      filters.titre = searchValue.searchTerm;
    }
    if (searchValue.department) {
      filters.localisation = searchValue.department; // Map department to location for now
    }
    if (searchValue.type) {
      filters.typedemploi = searchValue.type.toUpperCase().replace('-', '_') as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
    }

    this.adminService.getAllJobOffers(filters).subscribe({
      next: (jobOffers) => {
        console.log('Job offers loaded successfully:', jobOffers);
        this.jobOffers = jobOffers || []; // Ensure it's always an array
        this.filteredJobOffers = [...this.jobOffers];
        this.loading = false;
        
        if (this.jobOffers.length === 0) {
          console.log('No job offers found - this might be expected if backend is not running or has no data');
        }
      },      error: (error) => {
        console.error('Error loading job offers:', error);
        
        // Provide more specific error messages
        if (error.status === 0) {
          this.error = 'Cannot connect to the server. Loading mock data for development.';
          this.loadMockData(); // Load mock data as fallback
          return; // Don't set loading to false here as loadMockData handles it
        } else if (error.status === 404) {
          this.error = 'Job offers endpoint not found. Please check the API configuration.';
        } else if (error.status >= 500) {
          this.error = 'Server error occurred. Please try again later.';
        } else {
          this.error = `Failed to load job offers: ${error.message || 'Unknown error'}`;
        }
        
        this.loading = false;
        // Fallback to empty array
        this.jobOffers = [];
        this.filteredJobOffers = [];
      }
    });
  }
  setupSearchSubscription() {
    this.searchForm.valueChanges.subscribe(filters => {
      // For real-time filtering, we can either filter locally or call API
      // For now, let's filter locally for better UX, but reload when needed
      this.filterJobOffers(filters);
    });
  }

  filterJobOffers(filters: any) {
    this.filteredJobOffers = this.jobOffers.filter(jobOffer => {
      const matchesSearch = !filters.searchTerm || 
        jobOffer.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        jobOffer.department.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesDepartment = !filters.department || jobOffer.department === filters.department;
      const matchesStatus = !filters.status || jobOffer.status === filters.status;
      const matchesType = !filters.type || jobOffer.type === filters.type;
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesType;
    });
  }
  openJobOfferModal(jobOffer?: JobOfferDisplay) {
    this.editingJobOffer = jobOffer || null;
    this.showJobOfferModal = true;
    this.error = '';
    
    if (jobOffer) {      this.jobOfferForm.patchValue({
        title: jobOffer.title,
        department: jobOffer.department,
        location: jobOffer.location,
        type: jobOffer.type,
        description: jobOffer.description,
        requirements: jobOffer.requirements?.join(', '),
        salary: jobOffer.salary,
        deadline: jobOffer.deadline.toISOString().split('T')[0],
        experience: '2-3 years' // Default value, could be stored in backend later
      });
    } else {
      this.jobOfferForm.reset();
    }
  }

  closeJobOfferModal() {
    this.showJobOfferModal = false;
    this.editingJobOffer = null;
    this.jobOfferForm.reset();
    this.error = '';
  }
  saveJobOffer() {
    if (this.jobOfferForm.valid) {
      this.loading = true;
      this.error = '';
      const formValue = this.jobOfferForm.value;
      
      // Create the job offer object
      const jobOfferData: JobOfferDisplay = {
        id: this.editingJobOffer?.id || '',
        title: formValue.title,
        department: formValue.department,
        location: formValue.location,
        type: formValue.type,
        description: formValue.description,
        requirements: formValue.requirements ? formValue.requirements.split(',').map((r: string) => r.trim()) : [],
        salary: formValue.salary,
        deadline: new Date(formValue.deadline),
        status: this.editingJobOffer?.status || 'active',
        postedDate: this.editingJobOffer?.postedDate || new Date(),
        applicants: this.editingJobOffer?.applicants || 0
      };
      
      if (this.editingJobOffer) {
        // Update existing job offer
        this.adminService.updateJobOffer(this.editingJobOffer.id, jobOfferData).subscribe({
          next: (updatedJobOffer) => {
            const index = this.jobOffers.findIndex(jo => jo.id === this.editingJobOffer!.id);
            if (index !== -1) {
              this.jobOffers[index] = updatedJobOffer;
            }
            this.filterJobOffers(this.searchForm.value);
            this.closeJobOfferModal();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating job offer:', error);
            this.error = 'Failed to update job offer. Please try again.';
            this.loading = false;
          }
        });
      } else {
        // Create new job offer
        this.adminService.createJobOffer(jobOfferData).subscribe({
          next: (newJobOffer) => {
            this.jobOffers.push(newJobOffer);
            this.filterJobOffers(this.searchForm.value);
            this.closeJobOfferModal();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error creating job offer:', error);
            this.error = 'Failed to create job offer. Please try again.';
            this.loading = false;
          }
        });
      }
    }
  }
  deleteJobOffer(jobOfferId: string) {
    if (confirm('Are you sure you want to delete this job offer?')) {
      this.loading = true;
      this.adminService.deleteJobOffer(jobOfferId).subscribe({
        next: () => {
          this.jobOffers = this.jobOffers.filter(jo => jo.id !== jobOfferId);
          this.filterJobOffers(this.searchForm.value);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting job offer:', error);
          this.error = 'Failed to delete job offer. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  getActiveJobOffersCount(): number {
    return this.jobOffers.filter(jobOffer => jobOffer.status === 'active').length;
  }

  getInactiveJobOffersCount(): number {
    return this.jobOffers.filter(jobOffer => jobOffer.status === 'inactive').length;
  }

  getFilledJobOffersCount(): number {
    return this.jobOffers.filter(jobOffer => jobOffer.status === 'filled').length;
  }

  getTotalApplicants(): number {
    return this.jobOffers.reduce((total, jobOffer) => total + (jobOffer.applicants || 0), 0);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'filled': return 'status-filled';
      default: return '';
    }
  }
  toggleJobOfferStatus(jobOffer: JobOfferDisplay) {
    const newStatus = jobOffer.status === 'active' ? 'inactive' : 'active';
    
    // Update the job offer with new status
    const updatedJobOffer: JobOfferDisplay = {
      ...jobOffer,
      status: newStatus
    };
    
    this.adminService.updateJobOffer(jobOffer.id, updatedJobOffer).subscribe({
      next: (updated) => {
        // Update local data
        const index = this.jobOffers.findIndex(jo => jo.id === jobOffer.id);
        if (index !== -1) {
          this.jobOffers[index] = updated;
        }
        this.filterJobOffers(this.searchForm.value);
      },
      error: (error) => {
        console.error('Error updating job offer status:', error);
        this.error = 'Failed to update job offer status. Please try again.';
      }
    });
  }
  // Add refresh functionality
  refreshJobOffers() {
    this.loadData();
  }

  // Add method to reload with current filters
  reloadWithFilters() {
    this.loadData();
  }

  // Add method to archive job offer
  archiveJobOffer(jobOffer: JobOfferDisplay) {
    if (confirm('Are you sure you want to archive this job offer?')) {
      this.adminService.archiveJobOffer(jobOffer.id).subscribe({
        next: () => {
          // Update local data
          const index = this.jobOffers.findIndex(jo => jo.id === jobOffer.id);
          if (index !== -1) {
            this.jobOffers[index].status = 'inactive';
          }
          this.filterJobOffers(this.searchForm.value);
        },
        error: (error) => {
          console.error('Error archiving job offer:', error);
          this.error = 'Failed to archive job offer. Please try again.';
        }
      });
    }
  }

  // Add fallback mock data for development/testing
  private getMockJobOffers(): JobOfferDisplay[] {
    return [
    
    ];
  }

  // Method to load mock data as fallback
  loadMockData() {
    console.log('Loading mock data as fallback...');
    this.jobOffers = this.getMockJobOffers();
    this.filteredJobOffers = [...this.jobOffers];
    this.loading = false;
    this.error = 'Using mock data. Backend API is not available. Please start your backend server to see real data.';
  }

  // Method to toggle between API and mock data
  toggleDataSource() {
    this.useMockData = !this.useMockData;
    if (this.useMockData) {
      this.loadMockData();
    } else {
      this.loadJobOffers();
    }
  }

  // Override loadJobOffers to respect the mock data flag
  loadData() {
    if (this.useMockData) {
      this.loadMockData();
    } else {
      this.loadJobOffers();
    }
  }
}
