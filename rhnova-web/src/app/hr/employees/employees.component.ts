import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'on-leave';
  joinDate: Date;
  salary: number;
  avatar: string;
  skills: string[];
  manager: string;
}

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

  departments = ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations'];
  positions = ['Manager', 'Senior Developer', 'Junior Developer', 'Analyst', 'Specialist'];

  constructor(private fb: FormBuilder) {
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
    // Mock data - replace with actual API call
    this.employees = [
      {
        id: '1',
        firstName: 'maryem',
        lastName: 'Doe',
        email: 'maryem.doe@rhnova.com',
        phone: '+1 (555) 123-4567',
        department: 'Engineering',
        position: 'Senior Developer',
        status: 'active',
        joinDate: new Date('2023-01-15'),
        salary: 75000,
        avatar: '',
        skills: ['Angular', 'TypeScript', 'Node.js'],
        manager: 'Jane Smith'
      },
      {
        id: '2',
        firstName: 'Alice',
        lastName: 'maryemson',
        email: 'alice.maryemson@rhnova.com',
        phone: '+1 (555) 234-5678',
        department: 'HR',
        position: 'HR Manager',
        status: 'active',
        joinDate: new Date('2022-06-20'),
        salary: 65000,
        avatar: '',
        skills: ['Recruitment', 'Employee Relations', 'Training'],
        manager: 'Bob Wilson'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Brown',
        email: 'mike.brown@rhnova.com',
        phone: '+1 (555) 345-6789',
        department: 'Marketing',
        position: 'Marketing Specialist',
        status: 'on-leave',
        joinDate: new Date('2023-03-10'),
        salary: 55000,
        avatar: '',
        skills: ['Digital Marketing', 'Content Creation', 'SEO'],
        manager: 'Sarah Davis'
      }
    ];
    this.filteredEmployees = [...this.employees];
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
      
      if (this.editingEmployee) {
        // Update existing employee
        const index = this.employees.findIndex(emp => emp.id === this.editingEmployee!.id);
        if (index !== -1) {
          this.employees[index] = {
            ...this.editingEmployee,
            ...formValue,
            joinDate: new Date(formValue.joinDate)
          };
        }
      } else {
        // Add new employee
        const newEmployee: Employee = {
          id: Date.now().toString(),
          ...formValue,
          joinDate: new Date(formValue.joinDate),
          status: 'active' as const,
          avatar: '',
          skills: []
        };
        this.employees.push(newEmployee);
      }
      
      this.filterEmployees(this.searchForm.value);
      this.closeModal();
    }
  }

  deleteEmployee(employeeId: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employees = this.employees.filter(emp => emp.id !== employeeId);
      this.filterEmployees(this.searchForm.value);
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
    // Implementation for exporting employee data
    console.log('Exporting employees...');
  }

  importEmployees() {
    // Implementation for importing employee data
    console.log('Importing employees...');
  }
}
