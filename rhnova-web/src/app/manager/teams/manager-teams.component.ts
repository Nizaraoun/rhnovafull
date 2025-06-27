import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagerService, DetailedTeam, TeamMember as ApiTeamMember, TeamTaskStatistics, MemberTaskCounts } from '../services/manager.service';
import { forkJoin } from 'rxjs';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'Online' | 'Offline' | 'Away';
  tasksCompleted: number;
  totalTasks: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  manager: string;
  members: TeamMember[];
  createdDate: Date;
}

@Component({
  selector: 'app-manager-teams',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manager-teams.component.html',
  styleUrls: ['./manager-teams.component.scss']
})
export class ManagerTeamsComponent implements OnInit {
  teams: Team[] = [];
  isLoading = false;

  constructor(private managerService: ManagerService, private router: Router) { }

  ngOnInit(): void {
    console.log('ManagerTeamsComponent initialized');
    this.loadTeams();
  }  loadTeams(): void {
    this.isLoading = true;
    
    // Load team details and statistics in parallel
    forkJoin({
      teamDetails: this.managerService.getMyTeamDetails(),
    }).subscribe({

      next: ({ teamDetails }) => {
        console.log('Loaded team details:++++++++++++++++++', teamDetails);
        
        // Handle array response from API
        if (Array.isArray(teamDetails) && teamDetails.length > 0) {
          const teams = teamDetails.map(apiTeam => this.mapApiTeamToTeam(apiTeam));
          
          // Load individual member task counts for all teams
          Promise.all(teams.map(team => this.loadMemberTaskCounts(team)))
            .then(updatedTeams => {
              this.teams = updatedTeams;
              this.isLoading = false;
            })
            .catch(error => {
              console.error('Error loading member task counts:', error);
              this.teams = teams; // Use teams without task counts if loading fails
              this.isLoading = false;
            });
        } else {
          console.warn('No teams found or invalid response format');
          this.teams = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.isLoading = false;
        // Fallback to mock data if API fails
      }
    });
  }

  private async loadMemberTaskCounts(team: Team): Promise<Team> {
    try {
      const memberTaskPromises = team.members.map(member =>
        this.managerService.getMemberTaskCounts(member.id).toPromise()
      );
      
      const memberTaskCounts = await Promise.all(memberTaskPromises);
      
      team.members = team.members.map((member, index) => {
        const taskCounts = memberTaskCounts[index];
        if (taskCounts) {
          return {
            ...member,
            tasksCompleted: taskCounts.completedTasks,
            totalTasks: taskCounts.totalTasks
          };
        }
        return member;
      });
      
      return team;
    } catch (error) {
      console.error('Error loading member task counts:', error);
      return team; // Return team with mock data if member stats fail
    }
  }

private mapApiTeamToTeam(apiTeam: DetailedTeam, teamStats?: TeamTaskStatistics): Team {
  return {
    id: apiTeam.id,
    name: apiTeam.nom,
    description: apiTeam.description,
    manager: 'Current Manager', // Default manager value
    createdDate: new Date(),
    members: (apiTeam.membres && Array.isArray(apiTeam.membres)) 
      ? apiTeam.membres.map(member => this.mapApiMemberToMember(member))
      : [] // Return empty array if membres is undefined or not an array
  };
}

  private mapApiMemberToMember(apiMember: ApiTeamMember): TeamMember {
    return {
      id: apiMember.id,
      name: apiMember.name,
      email: apiMember.email,
      role: apiMember.role,
      status: 'Online', // Default status, could be enhanced with real-time data
      tasksCompleted: Math.floor(Math.random() * 10) + 1, // Mock completed tasks 1-10
      totalTasks: Math.floor(Math.random() * 5) + 5 // Mock total tasks 5-10
    };
  }

  private loadMockTeams(): void {
    // Mock data fallback
    this.teams = [
    
    ];
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'online': return 'status-online';
      case 'away': return 'status-away';
      case 'offline': return 'status-offline';
      default: return '';
    }
  }

  getCompletionPercentage(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  onAssignTask(team: Team): void {
    // Navigate to tasks page with team context
    this.router.navigate(['/manager/tasks'], { queryParams: { teamId: team.id, action: 'assign' } });
  }

  onViewProgress(team: Team): void {
    // Navigate to progress page with team context
    this.router.navigate(['/manager/progress'], { queryParams: { teamId: team.id } });
  }
}
