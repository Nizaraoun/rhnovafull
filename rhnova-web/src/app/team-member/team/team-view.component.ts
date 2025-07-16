import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamMemberService, DetailedTeam, TeamMember as ApiTeamMember } from '../services/team-member.service';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  position: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  workload: number;
  joinDate: Date;
}

interface Team {
  id: number;
  name: string;
  description: string;
  manager: string;
  members: TeamMember[];
  projects: string[];
  createdDate: Date;
}

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss']
})
export class TeamViewComponent implements OnInit {
  currentTeam: Team | null = null;
  currentUser = ''; // Will be set from auth service or localStorage
  isLoading = false;
  
  constructor(private teamMemberService: TeamMemberService) {}

  ngOnInit(): void {
    this.setCurrentUser();
    this.loadTeamInfo();
  }

  private setCurrentUser(): void {
    // Try to get current user from localStorage or auth service
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUser = user.name || user.username || '';
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Fallback if no user data found
    if (!this.currentUser) {
      this.currentUser = 'Current User';
    }
  }
  loadTeamInfo(): void {
    console.log('Loading team info...');
    this.isLoading = true;
    this.teamMemberService.getMyTeamDetails().subscribe({
      next: (apiTeam) => {
        this.currentTeam = this.mapApiTeamToTeam(apiTeam);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading team info:', error);
        this.isLoading = false;
        // Fallback to mock data if API fails
      }
    });
  }
  private mapApiTeamToTeam(apiTeam: DetailedTeam): Team {
    return {
      id: parseInt(apiTeam.id) || 1,
      name: apiTeam.nom,
      description: apiTeam.description,
      manager: apiTeam.manager?.name || 'Non assigné', // Handle null manager
      createdDate: new Date(), // API doesn't provide this, could be added later
      projects: [],
      members: apiTeam.membres.map((apiMember, index) => ({
        id: parseInt(apiMember.id) || index + 1,
        name: apiMember.name,
        email: apiMember.email,
        position: this.mapRoleToPosition(apiMember.role),
        avatar: '/assets/images/default-avatar.png',
        status: this.generateRandomStatus(),
        workload: Math.floor(Math.random() * 60) + 20, // 20-80% workload
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      }))
    };
  }

  private mapRoleToPosition(role: string): string {
    switch (role) {
      case 'RESPONSABLERH': return 'Responsable RH';
      case 'MEMBRE_EQUIPE': return 'Membre d\'équipe';
      case 'MANAGER': return 'Manager';
      case 'ADMIN': return 'Administrateur';
      default: return role;
    }
  }

  private generateRandomStatus(): 'online' | 'offline' | 'away' {
    const statuses: ('online' | 'offline' | 'away')[] = ['online', 'offline', 'away'];
    const weights = [0.6, 0.2, 0.2]; // 60% online, 20% offline, 20% away
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return statuses[i];
      }
    }
    return 'online';
  }

  
  

  
  getStatusClass(status: string): string {
    switch (status) {
      case 'online': return 'status-online';
      case 'away': return 'status-away';
      case 'offline': return 'status-offline';
      default: return '';
    }
  }

  getWorkloadColor(workload: number): string {
    if (workload >= 80) return '#e74c3c';
    if (workload >= 60) return '#f39c12';
    return '#27ae60';
  }

  isCurrentUser(memberName: string): boolean {
    return memberName === this.currentUser;
  }
  sendMessage(member: TeamMember): void {
    // TODO: Implement messaging functionality
    console.log('Send message to:', member.name);
    // Could navigate to messaging component or open a modal
    alert(`Message feature coming soon! Would send message to ${member.name}`);
  }

  viewProfile(member: TeamMember): void {
    // TODO: Navigate to profile view
    console.log('View profile of:', member.name);
    // Could navigate to profile component
    alert(`Profile view coming soon! Would view profile of ${member.name}`);
  }

  formatJoinDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} jour(s)`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} an(s)`;
    }
  }

  getAverageWorkload(): number {
    if (!this.currentTeam || this.currentTeam.members.length === 0) return 0;
    const total = this.currentTeam.members.reduce((sum, member) => sum + member.workload, 0);
    return Math.round(total / this.currentTeam.members.length);
  }

  getOnlineMembers(): number {
    if (!this.currentTeam) return 0;
    return this.currentTeam.members.filter(member => member.status === 'online').length;
  }

  // Method to refresh team data
  refreshTeamData(): void {
    this.loadTeamInfo();
  }

  // Method to get role-specific actions
  getRoleActions(member: TeamMember): string[] {
    const actions = ['message', 'profile'];
    
    // Add role-specific actions
    if (member.position.includes('Manager') || member.position.includes('Responsable')) {
      actions.push('schedule-meeting');
    }
    
    return actions;
  }
}
