import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../shared/services/base-http.service';

export interface Employee {
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

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'on-leave';
  joinDate: string;
  salary: number;
  skills: string[];
  manager: string;
}

export interface UpdateEmployeeDto extends CreateEmployeeDto {}

export interface EmployeeSearchParams {
  searchTerm?: string;
  department?: string;
  status?: string;
  page?: number;
  size?: number;
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
   * Get employee by email
   */
  getEmployeeByEmail(email: string): Observable<Employee> {
    return this.get<Employee>(`${this.apiEndpoint}/email/${encodeURIComponent(email)}`);
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

  /**
   * Deactivate employee
   */
  deactivateEmployee(employeeId: string): Observable<Employee> {
    return this.put<Employee>(`${this.apiEndpoint}/${employeeId}/deactivate`, {});
  }

  /**
   * Activate employee
   */
  activateEmployee(employeeId: string): Observable<Employee> {
    return this.put<Employee>(`${this.apiEndpoint}/${employeeId}/activate`, {});
  }

  /**
   * Get employees by department
   */
  getEmployeesByDepartment(department: string): Observable<Employee[]> {
    return this.get<Employee[]>(this.apiEndpoint, { department });
  }

  /**
   * Get employees by status
   */
  getEmployeesByStatus(status: string): Observable<Employee[]> {
    return this.get<Employee[]>(this.apiEndpoint, { status });
  }

  /**
   * Create multiple employees (bulk create)
   */
  createMultipleEmployees(employees: CreateEmployeeDto[]): Observable<Employee[]> {
    return this.post<Employee[]>(`${this.apiEndpoint}/bulk`, employees);
  }

  /**
   * Export employee data
   */
  exportEmployees(): Observable<Blob> {
    return this.get<Blob>(`${this.apiEndpoint}/export`);
  }

  /**
   * Import employee data
   */
  importEmployees(file: FormData): Observable<Employee[]> {
    return this.post<Employee[]>(`${this.apiEndpoint}/import`, file);
  }

  /**
   * Get employee statistics
   */
  getEmployeeStatistics(): Observable<{
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    byDepartment: { [department: string]: number };
  }> {
    return this.get(`${this.apiEndpoint}/statistics`);
  }

  /**
   * Search employees with advanced filtering
   */
  searchEmployees(searchParams: EmployeeSearchParams): Observable<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.get(`${this.apiEndpoint}/search`, searchParams);
  }


}
