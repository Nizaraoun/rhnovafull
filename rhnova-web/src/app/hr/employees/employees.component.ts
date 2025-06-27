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

  departments = ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations'];
  positions = ['Manager', 'Senior Developer', 'Junior Developer', 'Analyst', 'Specialist'];
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
      phone: ['', Validators.required],
      department: ['', Validators.required],
      position: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      joinDate: ['', Validators.required],
      manager: ['']
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.setupSearchSubscription();
  }

  getActiveEmployeesCount(): number {
    return this.employees.filter(employee => employee.status === 'active').length;
  }

  getOnLeaveEmployeesCount(): number {
    return this.employees.filter(employee => employee.status === 'on-leave').length;
  }
  loadEmployees() {
    this.isLoading = true;
    this.error = null;
    
    this.employeeApiService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees.map(emp => ({
          ...emp,
          joinDate: new Date(emp.joinDate)
        }));
        this.filteredEmployees = [...this.employees];
        this.isLoading = false;
        
        // Log dynamic cURL commands for the first employee (if any)
        
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.error = 'Failed to load employees. Using mock data instead.';
        this.isLoading = false;
      }
    });
  }

  setupSearchSubscription() {
    this.searchForm.valueChanges.subscribe(filters => {
      this.filterEmployees(filters);
    });
  }

  filterEmployees(filters: any) {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = !filters.searchTerm || 
        employee.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesDepartment = !filters.department || employee.department === filters.department;
      const matchesStatus = !filters.status || employee.status === filters.status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }

  openAddModal() {
    this.showAddModal = true;
    this.editingEmployee = null;
    this.employeeForm.reset();
  }

  editEmployee(employee: Employee) {
    this.editingEmployee = employee;
    this.showAddModal = true;
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
      joinDate: employee.joinDate.toISOString().split('T')[0],
      manager: employee.manager
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
        phone: formValue.phone,
        department: formValue.department,
        position: formValue.position,
        status: formValue.status || 'active',
        joinDate: formValue.joinDate,
        salary: formValue.salary,
        skills: formValue.skills || [],
        manager: formValue.manager || ''
      };
      
      if (this.editingEmployee) {
        // Update existing employee
        this.employeeApiService.updateEmployee(this.editingEmployee.id, employeeData).subscribe({
          next: (updatedEmployee) => {
            const index = this.employees.findIndex(emp => emp.id === this.editingEmployee!.id);
            if (index !== -1) {
              this.employees[index] = {
                ...updatedEmployee,
                joinDate: new Date(updatedEmployee.joinDate)
              };
            }
            this.filterEmployees(this.searchForm.value);
            this.closeModal();
            this.isLoading = false;
            
            // Log updated cURL commands
            
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            this.error = 'Failed to update employee';
            this.isLoading = false;
          }
        });
      } else {
        // Add new employee
        this.employeeApiService.createEmployee(employeeData).subscribe({
          next: (newEmployee) => {
            const employee = {
              ...newEmployee,
              joinDate: new Date(newEmployee.joinDate)
            };
            this.employees.push(employee);
            this.filterEmployees(this.searchForm.value);
            this.closeModal();
            this.isLoading = false;
            
            // Log cURL commands for new employee
          },
          error: (error) => {
            console.error('Error creating employee:', error);
            this.error = 'Failed to create employee';
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
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'on-leave': return 'status-on-leave';
      default: return '';
    }
  }
  exportEmployees() {
    this.isLoading = true;
    this.employeeApiService.exportEmployees().subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `employees_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
        
        // Log export cURL command
       
      },
      error: (error) => {
        console.error('Error exporting employees:', error);
        this.error = 'Failed to export employees';
        this.isLoading = false;
      }
    });
  }

  importEmployees() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        this.isLoading = true;
        this.employeeApiService.importEmployees(formData).subscribe({
          next: (importedEmployees) => {
            this.employees = importedEmployees.map(emp => ({
              ...emp,
              joinDate: new Date(emp.joinDate)
            }));
            this.filterEmployees(this.searchForm.value);
            this.isLoading = false;
            
            // Log import cURL command
          },
          error: (error) => {
            console.error('Error importing employees:', error);
            this.error = 'Failed to import employees';
            this.isLoading = false;
          }
        });
      }
    };
    input.click();
  }

  /**
   * Generate and log dynamic cURL commands for current employee
   */
  

  /**
   * Test API endpoint with dynamic data
   */
  testApiEndpoint(employee: Employee, operation: string) {
    switch (operation) {
      case 'get':
        this.employeeApiService.getEmployeeById(employee.id).subscribe({
          next: (result) => {
            console.log(`✅ GET Employee ${employee.id}:`, result);
          },
          error: (error) => console.error(`❌ GET Employee failed:`, error)
        });
        break;
        
      case 'deactivate':
        this.employeeApiService.deactivateEmployee(employee.id).subscribe({
          next: (result) => {
            console.log(`✅ Deactivated Employee ${employee.id}:`, result);
            // Update local data
            const index = this.employees.findIndex(emp => emp.id === employee.id);
            if (index !== -1) {
              this.employees[index] = { ...result, joinDate: new Date(result.joinDate) };
              this.filterEmployees(this.searchForm.value);
            }
          },
          error: (error) => console.error(`❌ Deactivate Employee failed:`, error)
        });
        break;
        
      case 'activate':
        this.employeeApiService.activateEmployee(employee.id).subscribe({
          next: (result) => {
            console.log(`✅ Activated Employee ${employee.id}:`, result);
            // Update local data
            const index = this.employees.findIndex(emp => emp.id === employee.id);
            if (index !== -1) {
              this.employees[index] = { ...result, joinDate: new Date(result.joinDate) };              this.filterEmployees(this.searchForm.value);
            }
          },
          error: (error) => console.error(`❌ Activate Employee failed:`, error)
        });
        break;
    }
  }

  /**
   * Search employees by department using API
   */
  searchByDepartment(department: string) {
    this.isLoading = true;
    this.employeeApiService.getEmployeesByDepartment(department).subscribe({
      next: (employees) => {
        this.filteredEmployees = employees.map(emp => ({
          ...emp,
          joinDate: new Date(emp.joinDate)
        }));
        this.isLoading = false;
        
        // Log search cURL command
        console.log(`🔍 Search by department cURL:`, 
          `curl -X GET "${this.employeeApiService['baseUrl']}/api/hr/employees?department=${department}" -H "Authorization: Bearer ${localStorage.getItem('auth_token')}"`);
      },
      error: (error) => {
        console.error('Error searching by department:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Get employee statistics with dynamic cURL logging
   */
  getStatistics() {
    this.employeeApiService.getEmployeeStatistics().subscribe({
      next: (stats) => {
        console.log('📊 Employee Statistics:', stats);
        
        // Log statistics cURL command
        console.log(`📈 Statistics cURL:`, 
          `curl -X GET "${this.employeeApiService['baseUrl']}/api/hr/employees/statistics" -H "Authorization: Bearer ${localStorage.getItem('auth_token')}"`);
      },
      error: (error) => console.error('Error getting statistics:', error)
    });
  }
}
