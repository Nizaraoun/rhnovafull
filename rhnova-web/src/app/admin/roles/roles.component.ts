import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Role {
  id: number;
  nom: string;
  description: string;
  permissions: string[];
  nombreUtilisateurs: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;
  roleForm: FormGroup;
  selectedRole: Role | null = null;

  availablePermissions = [
    { key: 'admin.read', label: 'Lecture administration' },
    { key: 'admin.write', label: 'Écriture administration' },
    { key: 'users.read', label: 'Lecture utilisateurs' },
    { key: 'users.write', label: 'Écriture utilisateurs' },
    { key: 'joboffers.read', label: 'Lecture offres d\'emploi' },
    { key: 'joboffers.write', label: 'Écriture offres d\'emploi' },
    { key: 'candidates.read', label: 'Lecture candidats' },
    { key: 'candidates.write', label: 'Écriture candidats' },
    { key: 'teams.read', label: 'Lecture équipes' },
    { key: 'teams.write', label: 'Écriture équipes' },
    { key: 'tasks.read', label: 'Lecture tâches' },
    { key: 'tasks.write', label: 'Écriture tâches' },
    { key: 'interviews.read', label: 'Lecture entretiens' },
    { key: 'interviews.write', label: 'Écriture entretiens' }
  ];

  constructor(private fb: FormBuilder) {
    this.roleForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;
    
    // Mock data
    setTimeout(() => {
      this.roles = [
        {
          id: 1,
          nom: 'ADMIN',
          description: 'Administrateur système avec tous les droits',
          permissions: ['admin.read', 'admin.write', 'users.read', 'users.write', 'joboffers.read', 'joboffers.write'],
          nombreUtilisateurs: 3
        },
        {
          id: 2,
          nom: 'RESPONSABLERH',
          description: 'Responsable des ressources humaines',
          permissions: ['users.read', 'users.write', 'joboffers.read', 'joboffers.write', 'candidates.read', 'candidates.write'],
          nombreUtilisateurs: 5
        },
        {
          id: 3,
          nom: 'MANAGER',
          description: 'Manager d\'équipe',
          permissions: ['teams.read', 'teams.write', 'tasks.read', 'tasks.write', 'interviews.read'],
          nombreUtilisateurs: 12
        },
        {
          id: 4,
          nom: 'MEMBRE_EQUIPE',
          description: 'Membre d\'équipe standard',
          permissions: ['tasks.read', 'teams.read'],
          nombreUtilisateurs: 89
        },
        {
          id: 5,
          nom: 'CANDIDAT',
          description: 'Candidat externe',
          permissions: ['joboffers.read'],
          nombreUtilisateurs: 156
        }
      ];
      this.isLoading = false;
    }, 500);
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedRole = null;
    this.roleForm.reset();
    this.roleForm.patchValue({ permissions: [] });
    this.showModal = true;
  }

  openEditModal(role: Role): void {
    this.isEditing = true;
    this.selectedRole = role;
    this.roleForm.patchValue(role);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.roleForm.reset();
    this.selectedRole = null;
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value;
      console.log('Role data:', roleData);
      
      if (this.isEditing) {
        console.log('Updating role:', this.selectedRole?.id);
      } else {
        console.log('Creating new role');
      }
      
      this.closeModal();
      // TODO: Implement actual save logic
    }
  }

  deleteRole(role: Role): void {
    if (role.nombreUtilisateurs > 0) {
      alert(`Impossible de supprimer le rôle "${role.nom}" car il est assigné à ${role.nombreUtilisateurs} utilisateur(s).`);
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`)) {
      console.log('Deleting role:', role.id);
      // TODO: Implement actual delete logic
    }
  }

  onPermissionChange(permission: string, event: any): void {
    const permissions = this.roleForm.get('permissions')?.value || [];
    
    if (event.target.checked) {
      if (!permissions.includes(permission)) {
        permissions.push(permission);
      }
    } else {
      const index = permissions.indexOf(permission);
      if (index > -1) {
        permissions.splice(index, 1);
      }
    }
    
    this.roleForm.patchValue({ permissions });
  }

  isPermissionSelected(permission: string): boolean {
    const permissions = this.roleForm.get('permissions')?.value || [];
    return permissions.includes(permission);
  }

  getPermissionLabel(permissionKey: string): string {
    const permission = this.availablePermissions.find(p => p.key === permissionKey);
    return permission ? permission.label : permissionKey;
  }
}
