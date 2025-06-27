import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Team {
  id: string;
  name: string;
  department: string;
  managerId?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  teamId: string;
  department: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teams: Team[] = [
    { id: '1', name: 'Développement', department: 'IT' },
    { id: '2', name: 'Marketing', department: 'Marketing' },
    { id: '3', name: 'RH', department: 'Human Resources' },
    { id: '4', name: 'Finance', department: 'Finance' },
    { id: '5', name: 'Support', department: 'Customer Service' }
  ];

  private employees: Employee[] = [
    // Mock data - in a real application, this would come from an API
  ];

  constructor() {}

  /**
   * Get all teams
   */
  getTeams(): Observable<Team[]> {
    return of(this.teams);
  }

  /**
   * Get team by ID
   */
  getTeamById(teamId: string): Observable<Team | undefined> {
    const team = this.teams.find(t => t.id === teamId);
    return of(team);
  }

  /**
   * Get employee's team
   */
  getEmployeeTeam(employeeId: string): Observable<string> {
    // In a real application, you would look up the employee's team from the database
    // For now, use a simple hash function to assign consistent teams
    const teams = this.teams.map(t => t.name);
    
    let hash = 0;
    for (let i = 0; i < employeeId.length; i++) {
      const char = employeeId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const teamName = teams[Math.abs(hash) % teams.length];
    return of(teamName);
  }

  /**
   * Get employees by team
   */
  getEmployeesByTeam(teamId: string): Observable<Employee[]> {
    const employees = this.employees.filter(e => e.teamId === teamId);
    return of(employees);
  }
}
