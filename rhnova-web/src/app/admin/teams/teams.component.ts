import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Team, AdminService } from '../services/admin.service';
import { UserDto } from '../../shared/models';
import { Role } from '../../shared/models/role.model';

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
  teamForm: FormGroup;
  selectedTeam: Team | null = null;
  selectedTeamMembers: UserDto[] = [];
  availableUsers: UserDto[] = [];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      managerId: ['', Validators.required],
      departement: ['', Validators.required],
      budget: ['', [Validators.min(0)]],
      objectifs: ['']
    });
  }
  ngOnInit(): void {
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
  }
  updateAvailableUsers(): void {
    // Filter users to only show those with MEMBRE_EQUIPE role
    const eligibleUsers = this.allUsers.filter(user => user.role === Role.MEMBRE_EQUIPE);
    
    if (this.selectedTeam) {
      const teamMemberIds = this.selectedTeam.membreIds || [];
      this.availableUsers = eligibleUsers.filter(user => 
        !teamMemberIds.includes(user.id)
      );
    } else {
      this.availableUsers = eligibleUsers;
    }
  }
  loadTeams(): void {
    this.isLoading = true;
    this.adminService.getAllTeams().subscribe({
      next: (teams: Team[]) => {
        this.teams = teams;
        this.filteredTeams = teams;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading teams:', error);
        this.isLoading = false;
      }
    });
  }
  filterTeams(): void {
    this.filteredTeams = this.teams.filter(team => 
      !this.searchTerm || 
      team.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (team.departement && team.departement.toLowerCase().includes(this.searchTerm.toLowerCase()))
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
  }

  openEditModal(team: Team): void {
    this.isEditing = true;
    this.selectedTeam = team;
    this.teamForm.patchValue(team);
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
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      const teamData = this.teamForm.value;
      
      if (this.isEditing && this.selectedTeam) {
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
    return team.membreIds ? team.membreIds.length : 0;
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
        console.error('Error loading team members:', error);
        // Fallback: get member details from IDs
        if (this.selectedTeam && this.selectedTeam.membreIds) {
          this.selectedTeamMembers = this.allUsers.filter(user => 
            this.selectedTeam!.membreIds.includes(user.id)
          );
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
  }

  getManagerName(managerId: string): string {
    const manager = this.allUsers.find(user => user.id === managerId);
    return manager ? manager.name : managerId;
  }

  getMemberName(memberId: string): string {
    const member = this.allUsers.find(user => user.id === memberId);
    return member ? member.name : `User ${memberId}`;
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
}
