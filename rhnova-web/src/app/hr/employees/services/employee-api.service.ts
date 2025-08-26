import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../shared/services/base-http.service';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  phoneNumber: string;
  address: string;
  joinDate: Date;
  status?: 'active' | 'inactive' | 'on-leave';
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  phoneNumber: string;
  address: string;
  joinDate: string;
}

export interface UpdateEmployeeDto extends CreateEmployeeDto {}

export interface EmployeeSearchParams {
  searchTerm?: string;
  department?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService extends BaseHttpService {
  private  apiEndpoint = '/api/hr/employees';

  /**
   * Get all employees with optional filtering
   */
  getAllEmployees(params?: EmployeeSearchParams): Observable<Employee[]> {
    return this.get<Employee[]>(this.apiEndpoint, params);
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(employeeId: string): Observable<Employee> {
    return this.get<Employee>(`${this.apiEndpoint}/${employeeId}`);
  }

  /**
   * Create new employee
   */
  createEmployee(employeeData: CreateEmployeeDto): Observable<Employee> {
    return this.post<Employee>(this.apiEndpoint, employeeData);
  }

  /**
   * Update existing employee
   */
  updateEmployee(employeeId: string, employeeData: UpdateEmployeeDto): Observable<Employee> {
    return this.put<Employee>(`${this.apiEndpoint}/${employeeId}`, employeeData);
  }

  /**
   * Delete employee
   */
  deleteEmployee(employeeId: string): Observable<void> {
    return this.delete<void>(`${this.apiEndpoint}/${employeeId}`);
  }


}
