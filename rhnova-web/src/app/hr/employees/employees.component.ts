import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeApiService, Employee, CreateEmployeeDto, UpdateEmployeeDto } from './services/employee-api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {


  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchForm: FormGroup;
  employeeForm: FormGroup;
  showAddModal = false;
  editingEmployee: Employee | null = null;
  selectedDepartment = '';
  selectedStatus = '';
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    public employeeApiService: EmployeeApiService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      department: [''],
      status: ['']
    });

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      joinDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.setupSearchSubscription();
  }

  getActiveEmployeesCount(): number {
    return this.employees.filter(employee => employee.status === 'active' || !employee.status).length;
  }

  getOnLeaveEmployeesCount(): number {
    return this.employees.filter(employee => employee.status === 'on-leave').length;
  }
  loadEmployees() {
    this.isLoading = true;
    this.error = null;
    
    console.log('Loading employees from API...');
    this.employeeApiService.getAllEmployees().subscribe({
      next: (employees) => {
        console.log('Employees loaded from API:', employees);
        this.employees = employees.map(emp => ({
          ...emp,
          joinDate: new Date(emp.joinDate),
          status: emp.status || 'active' // Default status if not provided
        }));
        this.filteredEmployees = [...this.employees];
        this.isLoading = false;
        console.log('Processed employees:', this.employees);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.error = 'Failed to load employees. Please refresh the page or try again.';
        this.isLoading = false;
        
        // Initialize with empty arrays to prevent further errors
        this.employees = [];
        this.filteredEmployees = [];
      }
    });
  }

  /**
   * Refresh employee list from server
   */
  refreshEmployees() {
    this.loadEmployees();
  }



  setupSearchSubscription() {
    this.searchForm.valueChanges.subscribe(filters => {
      this.filterEmployees(filters);
    });
  }

  filterEmployees(filters: any) {
    console.log('Filtering employees with filters:', filters);
    console.log('Total employees before filtering:', this.employees.length);
    
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = !filters.searchTerm || 
        employee.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesDepartment = !filters.department || employee.department === filters.department;
      const matchesStatus = !filters.status || employee.status === filters.status || (!employee.status && filters.status === 'active');

      return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    console.log('Filtered employees count:', this.filteredEmployees.length);
    console.log('Filtered employees:', this.filteredEmployees);
  }

  openAddModal() {
    this.showAddModal = true;
    this.editingEmployee = null;
    this.error = null; // Clear any previous errors
    this.employeeForm.reset();
    
    // Ensure form is properly reset with empty values
    this.employeeForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      position: '',
      salary: '',
      phoneNumber: '',
      address: '',
      joinDate: ''
    });
  }

  editEmployee(employee: Employee) {
    this.editingEmployee = employee;
    this.showAddModal = true;
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
      phoneNumber: employee.phoneNumber,
      address: employee.address,
      joinDate: employee.joinDate.toISOString().split('T')[0]
    });
  }
  saveEmployee() {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      this.isLoading = true;
      
      const employeeData: CreateEmployeeDto | UpdateEmployeeDto = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        department: formValue.department,
        position: formValue.position,
        salary: formValue.salary,
        phoneNumber: formValue.phoneNumber,
        address: formValue.address,
        joinDate: formValue.joinDate
      };
      
      if (this.editingEmployee) {
        // Update existing employee
        console.log('Updating employee with data:', employeeData);
        this.employeeApiService.updateEmployee(this.editingEmployee.id, employeeData).subscribe({
          next: (updatedEmployee) => {
            console.log('Employee updated successfully:', updatedEmployee);
            const index = this.employees.findIndex(emp => emp.id === this.editingEmployee!.id);
            if (index !== -1) {
              this.employees[index] = {
                ...updatedEmployee,
                joinDate: new Date(updatedEmployee.joinDate),
                status: updatedEmployee.status || 'active'
              };
            }
            this.filteredEmployees = [...this.employees]; // Update filtered list immediately
            this.filterEmployees(this.searchForm.value);
            this.closeModal();
            this.isLoading = false;
            console.log('Updated employees list:', this.employees);
            
            // Show success message
            this.error = null;
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            this.error = 'Failed to update employee. Please try again.';
            this.isLoading = false;
          }
        });
      } else {
        // Add new employee
        console.log('Creating new employee with data:', employeeData);
        this.employeeApiService.createEmployee(employeeData).subscribe({
          next: (newEmployee) => {
            console.log('Employee created successfully:', newEmployee);
            const employee = {
              ...newEmployee,
              joinDate: new Date(newEmployee.joinDate),
              status: newEmployee.status || 'active' // Ensure status is set
            };
            
            // Try to add to local array
            try {
              this.employees.push(employee);
              this.filteredEmployees = [...this.employees]; // Update filtered list immediately
              this.filterEmployees(this.searchForm.value);
              console.log('Updated employees list:', this.employees);
            } catch (localError) {
              console.error('Error updating local list, refreshing from server:', localError);
              // If local update fails, refresh from server as fallback
              this.refreshEmployees();
            }
            
            this.closeModal();
            this.isLoading = false;
            
            // Show success message
            this.error = null;
          },
          error: (error) => {
            console.error('Error creating employee:', error);
            this.error = 'Failed to create employee. Please try again.';
            this.isLoading = false;
          }
        });
      }
    }
  }
  deleteEmployee(employeeId: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.isLoading = true;
      
      this.employeeApiService.deleteEmployee(employeeId).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp.id !== employeeId);
          this.filterEmployees(this.searchForm.value);
          this.isLoading = false;
          
          // Log updated cURL commands
         
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.error = 'Failed to delete employee';
          this.isLoading = false;
        }
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.editingEmployee = null;
    this.employeeForm.reset();
    this.error = null; // Clear any previous errors
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'on-leave': return 'status-on-leave';
      default: return 'status-active'; // Default to active if status is undefined
    }
  }
}
