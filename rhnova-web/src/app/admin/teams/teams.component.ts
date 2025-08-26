import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Team, AdminService, TeamRequest } from '../services/admin.service';
import { UserDto } from '../../shared/models';
import { Role } from '../../shared/models/role.model';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  allUsers: UserDto[] = [];
  isLoading = false;
  searchTerm = '';
  showModal = false;
  showMemberModal = false;
  isEditing = false;
  teamForm: FormGroup;  selectedTeam: Team | null = null;  selectedTeamMembers: UserDto[] = [];
  availableUsers: UserDto[] = [];
  currentUserRole: string | null = null;
  readonly Role = Role; // Make Role enum available in template

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.teamForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      managerId: ['', Validators.required]
    });
  }  ngOnInit(): void {
    this.currentUserRole = this.authService.getUserRole();
    this.loadTeams();
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users: UserDto[]) => {
        this.allUsers = users;
        this.updateAvailableUsers();
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }  updateAvailableUsers(): void {
    // Filter users to only show those with MEMBRE_EQUIPE role
    const eligibleUsers = this.allUsers.filter(user => user.role === Role.MEMBRE_EQUIPE);
    
    if (this.selectedTeam) {
      const teamMemberIds = this.selectedTeam.membres ? this.selectedTeam.membres.map(m => m.id) : [];
      this.availableUsers = eligibleUsers.filter(user => 
        !teamMemberIds.includes(user.id)
      );
    } else {
      this.availableUsers = eligibleUsers;
    }
  }  loadTeams(): void {
    this.isLoading = true;
    this.adminService.getAllTeams().subscribe({
      next: (teams: Team[]) => {
        // Managers, Admins and HR can see all teams
        this.teams = teams;
        this.filteredTeams = this.teams;
        this.isLoading = false;
        console.log('Teams loaded:', this.teams);
      },
      error: (error: any) => {
        console.error('Error loading teams:', error);
        this.isLoading = false;
      }
    });
  }filterTeams(): void {
    this.filteredTeams = this.teams.filter(team => 
      !this.searchTerm || 
      team.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedTeam = null;
    this.teamForm.reset();
    // Mark all fields as untouched to prevent showing validation errors initially
    Object.keys(this.teamForm.controls).forEach(key => {
      this.teamForm.get(key)?.markAsUntouched();
    });
    this.showModal = true;
  }  openEditModal(team: Team): void {
    this.isEditing = true;
    this.selectedTeam = team;
    this.teamForm.patchValue({
      nom: team.nom,
      description: team.description,
      managerId: team.manager?.id || ''
    });
    // Mark all fields as untouched to prevent showing validation errors initially
    Object.keys(this.teamForm.controls).forEach(key => {
      this.teamForm.get(key)?.markAsUntouched();
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.teamForm.reset();
    this.selectedTeam = null;
    // Reset form validation state
    Object.keys(this.teamForm.controls).forEach(key => {
      this.teamForm.get(key)?.markAsUntouched();
    });
  }  onSubmit(): void {
    if (this.teamForm.valid) {
      const formValue = this.teamForm.value;
      
      // Map form data to match the expected API structure
      const teamData: TeamRequest = {
        nom: formValue.nom,
        description: formValue.description || '',
        managerId: formValue.managerId,
        membreIds: [] // Initialize with empty array, members will be added separately
      };
      
      console.log('Sending team data to API:', teamData);
        if (this.isEditing && this.selectedTeam) {
        // For editing, preserve existing member IDs
        teamData.membreIds = this.selectedTeam.membres ? this.selectedTeam.membres.map(m => m.id) : [];
        
        this.adminService.updateTeam(this.selectedTeam.id, teamData).subscribe({
          next: () => {
            this.loadTeams();
            this.closeModal();
          },
          error: (error: any) => {
            console.error('Error updating team:', error);
            // You could add a toast notification here
          }
        });
      } else {
        this.adminService.createTeam(teamData).subscribe({
          next: () => {
            this.loadTeams();
            this.closeModal();
          },
          error: (error: any) => {
            console.error('Error creating team:', error);
            // You could add a toast notification here
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.teamForm.controls).forEach(key => {
        this.teamForm.get(key)?.markAsTouched();
      });
    }
  }

  deleteTeam(team: Team): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${team.nom}" ?`)) {
      this.adminService.deleteTeam(team.id).subscribe({
        next: () => this.loadTeams(),
      });
    }
  }  getMemberCount(team: Team): number {
    return team.membres ? team.membres.length : 0;
  }

  openMemberModal(team: Team): void {
    this.selectedTeam = team;
    this.loadTeamMembers(team.id);
    this.updateAvailableUsers();
    this.showMemberModal = true;
  }

  closeMemberModal(): void {
    this.showMemberModal = false;
    this.selectedTeam = null;
    this.selectedTeamMembers = [];
  }

  loadTeamMembers(teamId: string): void {
    this.adminService.getTeamMembers(teamId).subscribe({
      next: (members: UserDto[]) => {
        this.selectedTeamMembers = members;
      },
      error: (error: any) => {
        console.error('Error loading team members:', error);        // Fallback: get member details from IDs
        if (this.selectedTeam && this.selectedTeam.membres) {
          this.selectedTeamMembers = this.selectedTeam.membres;
        }
      }
    });
  }
  addMemberToTeam(userId: string): void {
    if (this.selectedTeam) {
      // Double-check that the user has the correct role
      const user = this.allUsers.find(u => u.id === userId);
      if (!user || !this.canJoinTeam(user)) {
        alert('Erreur: Seuls les utilisateurs avec le rôle "MEMBRE_EQUIPE" peuvent rejoindre une équipe.');
        return;
      }

      this.adminService.addMemberToTeam(this.selectedTeam.id, userId).subscribe({
        next: () => {
          this.loadTeamMembers(this.selectedTeam!.id);
          this.loadTeams(); // Refresh teams to update member count
          this.updateAvailableUsers();
        },
        error: (error: any) => {
          console.error('Error adding member to team:', error);
        }
      });
    }
  }

  removeMemberFromTeam(userId: string): void {
    if (this.selectedTeam && confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?')) {
      this.adminService.removeMemberFromTeam(this.selectedTeam.id, userId).subscribe({
        next: () => {
          this.loadTeamMembers(this.selectedTeam!.id);
          this.loadTeams(); // Refresh teams to update member count
          this.updateAvailableUsers();
        },
        error: (error: any) => {
          console.error('Error removing member from team:', error);
        }
      });
    }
  }  getManagerName(team: Team): string {
    return team.manager ? team.manager.name : 'Non assigné';
  }

  getManagerUsers(): UserDto[] {
    return this.allUsers.filter(user => user.role === Role.MANAGER);
  }

  canJoinTeam(user: UserDto): boolean {
    return user.role === Role.MEMBRE_EQUIPE;
  }
  getRoleDisplayName(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Administrateur';
      case Role.RESPONSABLERH:
        return 'Responsable RH';
      case Role.MANAGER:
        return 'Manager';
      case Role.MEMBRE_EQUIPE:
        return 'Membre d\'équipe';
      case Role.CANDIDAT:
        return 'Candidat';
      default:
        return role;
    }
  }
  canCreateTeam(): boolean {
    return this.currentUserRole === Role.ADMIN || 
           this.currentUserRole === Role.RESPONSABLERH || 
           this.currentUserRole === Role.MANAGER;
  }

  canEditTeam(): boolean {
    return this.currentUserRole === Role.ADMIN || 
           this.currentUserRole === Role.RESPONSABLERH || 
           this.currentUserRole === Role.MANAGER;
  }

  canDeleteTeam(): boolean {
    return this.currentUserRole === Role.ADMIN || 
           this.currentUserRole === Role.RESPONSABLERH || 
           this.currentUserRole === Role.MANAGER;
  }

  canManageMembers(): boolean {
    return this.currentUserRole === Role.ADMIN || 
           this.currentUserRole === Role.RESPONSABLERH || 
           this.currentUserRole === Role.MANAGER;
  }
}
