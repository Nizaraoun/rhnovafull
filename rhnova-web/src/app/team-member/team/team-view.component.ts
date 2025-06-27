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
  skills: string[];
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
        this.loadMockTeamInfo();
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
      projects: this.generateMockProjects(), // Generate some mock projects for display
      members: apiTeam.membres.map((apiMember, index) => ({
        id: parseInt(apiMember.id) || index + 1,
        name: apiMember.name,
        email: apiMember.email,
        position: this.mapRoleToPosition(apiMember.role),
        avatar: '/assets/images/default-avatar.png',
        status: this.generateRandomStatus(),
        workload: Math.floor(Math.random() * 60) + 20, // 20-80% workload
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        skills: this.generateSkillsForRole(apiMember.role)
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

  private generateMockProjects(): string[] {
    const possibleProjects = [
      'Application RH Nova Web',
      'Module de gestion des congés',
      'API de gestion des utilisateurs',
      'Dashboard analytics',
      'Système de notification',
      'Module de recrutement',
      'Gestion des performances'
    ];
    
    const numProjects = Math.floor(Math.random() * 4) + 2; // 2-5 projects
    const shuffled = possibleProjects.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numProjects);
  }

  private generateSkillsForRole(role: string): string[] {
    const skillSets: { [key: string]: string[] } = {
      'RESPONSABLERH': ['Gestion RH', 'Recrutement', 'Formation', 'Droit du travail'],
      'MEMBRE_EQUIPE': ['TypeScript', 'Angular', 'JavaScript', 'CSS'],
      'MANAGER': ['Leadership', 'Gestion de projet', 'Planification', 'Communication'],
      'ADMIN': ['Administration système', 'Sécurité', 'Base de données', 'DevOps'],
      'default': ['Communication', 'Travail d\'équipe', 'Problem solving']
    };
    
    const skills = skillSets[role] || skillSets['default'];
    const numSkills = Math.floor(Math.random() * 3) + 2; // 2-4 skills
    return skills.slice(0, numSkills);
  }

  private loadMockTeamInfo(): void {
    // Mock data fallback - original implementation
    this.currentTeam = {
      id: 1,
      name: 'Équipe Développement',
      description: 'Équipe responsable du développement des applications web et mobiles pour RH Nova.',
      manager: 'Jean Dupont',
      createdDate: new Date('2024-01-15'),
      projects: [
        'Application RH Nova Web',
        'Module de gestion des congés',
        'API de gestion des utilisateurs',
        'Dashboard analytics'
      ],
      members: [
        {
          id: 1,
          name: 'Sarah Martin',
          email: 'sarah.martin@company.com',
          position: 'Développeur Senior',
          avatar: '/assets/images/default-avatar.png',
          status: 'online',
          workload: 85,
          joinDate: new Date('2023-03-15'),
          skills: ['Angular', 'TypeScript', 'Node.js', 'Python']
        },
        {
          id: 2,
          name: 'Ahmed Ben Ali',
          email: 'ahmed.benali@company.com',
          position: 'Développeur Frontend',
          avatar: '/assets/images/default-avatar.png',
          status: 'online',
          workload: 70,
          joinDate: new Date('2023-06-01'),
          skills: ['React', 'JavaScript', 'CSS', 'HTML']
        },
        {
          id: 3,
          name: 'Emma Dubois',
          email: 'emma.dubois@company.com',
          position: 'Développeur Backend',
          avatar: '/assets/images/default-avatar.png',
          status: 'away',
          workload: 60,
          joinDate: new Date('2023-08-10'),
          skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker']
        },
        {
          id: 4,
          name: 'Thomas Rousseau',
          email: 'thomas.rousseau@company.com',
          position: 'DevOps Engineer',
          avatar: '/assets/images/default-avatar.png',
          status: 'offline',
          workload: 75,
          joinDate: new Date('2023-04-20'),
          skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
        },
        {
          id: 5,
          name: 'Marie Blanchard',
          email: 'marie.blanchard@company.com',
          position: 'UI/UX Designer',
          avatar: '/assets/images/default-avatar.png',
          status: 'online',
          workload: 55,
          joinDate: new Date('2023-09-05'),
          skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping']
        }
      ]
    };
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
