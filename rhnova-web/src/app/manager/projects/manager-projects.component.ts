import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ManagerService, Project, CreateProjectRequest, CreateTaskRequest, ManagerTask, TeamMember, DetailedTeam } from '../services/manager.service';

@Component({
  selector: 'app-manager-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manager-projects.component.html',
  styleUrls: ['./manager-projects.component.scss']
})
export class ManagerProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  teamMembers: TeamMember[] = [];
  teamDetails: DetailedTeam | null = null;
  isLoading = false;
  
  // Filter properties
  searchTerm = '';
  statusFilter = 'all';
  
  // Modal properties
  showCreateModal = false;
  showEditModal = false;
  showAssignTeamModal = false;
  showCreateTaskModal = false;
  showProjectTasksModal = false;
  selectedProject: Project | null = null;
  selectedProjectTasks: ManagerTask[] = [];
  isLoadingTasks = false;
  
  // Forms
  projectForm: FormGroup;
  taskForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private managerService: ManagerService
  ) {
    this.projectForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      budget: ['', [Validators.required]],
      statut: ['EN_ATTENTE', Validators.required]
    });
    
    this.taskForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      priorite: ['MOYENNE', Validators.required],
      statut: ['A_FAIRE', Validators.required],
      assigneeId: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadTeamDetails();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.managerService.getMyProjects().subscribe({
      next: (projects) => {
        console.log('Loaded projects:', projects); // Debug log
        this.projects = projects;
        this.filteredProjects = [...this.projects];
        console.log('Filtered projects:', this.filteredProjects); // Debug log
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
        // Fallback to mock data if needed
        this.loadMockProjects();
      }
    });
  }

  loadTeamDetails(): void {
    this.managerService.getMyTeam().subscribe({
      next: (teamDetails) => {
        this.teamDetails = teamDetails;
        this.teamMembers = teamDetails.membres || [];
      },
      error: (error) => {
        console.error('Error loading team details:', error);
        this.teamMembers = [];
      }
    });
  }

  private loadMockProjects(): void {
    // Mock data fallback with more realistic data
    this.projects = [
    
    ];
    this.filteredProjects = [...this.projects];
  }

  applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = project.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || project.statut === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  // Modal methods
  openCreateModal(): void {
    this.projectForm.reset();
    this.projectForm.patchValue({
      statut: 'EN_ATTENTE',
      budget: ''
    });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.projectForm.reset();
  }

  openEditModal(project: Project): void {
    this.selectedProject = project;
    this.projectForm.patchValue({
      nom: project.nom,
      description: project.description,
      dateDebut: project.dateDebut,
      dateFin: project.dateFin,
      budget: project.budget,
      statut: project.statut
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProject = null;
    this.projectForm.reset();
  }

  openAssignTeamModal(project: Project): void {
    this.selectedProject = project;
    this.showAssignTeamModal = true;
  }

  closeAssignTeamModal(): void {
    this.showAssignTeamModal = false;
    this.selectedProject = null;
  }

  openCreateTaskModal(project: Project): void {
    this.selectedProject = project;
    this.taskForm.reset();
    this.taskForm.patchValue({
      priorite: 'MOYENNE',
      statut: 'A_FAIRE'
    });
    this.showCreateTaskModal = true;
  }

  closeCreateTaskModal(): void {
    this.showCreateTaskModal = false;
    this.selectedProject = null;
    this.taskForm.reset();
  }

  openProjectTasksModal(project: Project): void {
    this.selectedProject = project;
    this.showProjectTasksModal = true;
    this.loadProjectTasks(project.id);
  }

  closeProjectTasksModal(): void {
    this.showProjectTasksModal = false;
    this.selectedProject = null;
    this.selectedProjectTasks = [];
  }

  createTaskInProject(): void {
    if (this.taskForm.valid && this.selectedProject) {
      const formData = this.taskForm.value;
      
      // Basic date validation
      if (new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
        alert('Task end date must be after start date');
        return;
      }

      const taskData: CreateTaskRequest = formData;
      
      this.managerService.createTaskInProject(this.selectedProject.id, taskData).subscribe({
        next: (task) => {
          console.log('Task created successfully:', task);
          this.closeCreateTaskModal();
          // Optionally reload project tasks or update the UI
          this.loadProjectTasks(this.selectedProject!.id);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          alert('Error creating task. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.taskForm);
    }
  }

  loadProjectTasks(projectId: string): void {
    this.isLoadingTasks = true;
    this.managerService.getProjectTasks(projectId).subscribe({
      next: (tasks) => {
        this.selectedProjectTasks = tasks;
        this.isLoadingTasks = false;
      },
      error: (error) => {
        console.error('Error loading project tasks:', error);
        this.selectedProjectTasks = [];
        this.isLoadingTasks = false;
      }
    });
  }

  // CRUD Operations
  createProject(): void {
    if (this.projectForm.valid) {
      const formData = this.projectForm.value;
      
      // Basic date validation
      if (new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
        alert('End date must be after start date');
        return;
      }

      const createRequest: CreateProjectRequest = {
        nom: formData.nom,
        description: formData.description,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        budget: formData.budget,
        statut: formData.statut
      };

      this.managerService.createProject(createRequest).subscribe({
        next: (createdProject) => {
          this.projects.push(createdProject);
          this.applyFilters();
          this.closeCreateModal();
          console.log('Project created successfully');
        },
        error: (error) => {
          console.error('Error creating project:', error);
          alert('Error creating project. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.projectForm);
    }
  }

  updateProject(): void {
    if (this.projectForm.valid && this.selectedProject) {
      const formData = this.projectForm.value;
      
      // Basic date validation
      if (new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
        alert('End date must be after start date');
        return;
      }

      const updateRequest: Partial<CreateProjectRequest> = {
        nom: formData.nom,
        description: formData.description,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        budget: formData.budget,
        statut: formData.statut
      };

      this.managerService.updateProject(this.selectedProject.id, updateRequest).subscribe({
        next: (updatedProject) => {
          const index = this.projects.findIndex(p => p.id === this.selectedProject!.id);
          if (index !== -1) {
            this.projects[index] = updatedProject;
          }
          this.applyFilters();
          this.closeEditModal();
          console.log('Project updated successfully');
        },
        error: (error) => {
          console.error('Error updating project:', error);
          alert('Error updating project. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.projectForm);
    }
  }

  deleteProject(projectId: string): void {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.managerService.deleteProject(projectId).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== projectId);
          this.applyFilters();
          console.log('Project deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting project:', error);
          alert('Error deleting project. Please try again.');
        }
      });
    }
  }

  assignTeamToProject(): void {
    if (this.selectedProject && this.teamDetails) {
      this.managerService.assignProjectToTeam(this.selectedProject.id, this.teamDetails.id).subscribe({
        next: () => {
          // Update the project with team information
          const project = this.projects.find(p => p.id === this.selectedProject!.id);
          if (project) {
            project.equipeId = this.teamDetails!.id;
            project.equipeNom = this.teamDetails!.nom;
          }
          this.closeAssignTeamModal();
        },
        error: (error) => {
          console.error('Error assigning team to project:', error);
          // Handle error - show toast or alert
        }
      });
    }
  }

  updateProjectProgression(projectId: string): void {
    this.managerService.updateProjectProgression(projectId).subscribe({
      next: (updatedProject) => {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          this.projects[index] = updatedProject;
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error updating project progression:', error);
        // Handle error - show toast or alert
      }
    });
  }

  // Helper methods for task management
  getTaskStatusClass(status: string): string {
    switch (status) {
      case 'A_FAIRE': return 'status-pending';
      case 'EN_COURS': return 'status-in-progress';
      case 'TERMINEE': return 'status-completed';
      default: return '';
    }
  }

  getTaskStatusText(status: string): string {
    switch (status) {
      case 'A_FAIRE': return 'En Attente';
      case 'EN_COURS': return 'En Cours';
      case 'TERMINEE': return 'Terminée';
      default: return status;
    }
  }

  getTaskPriorityClass(priority: string): string {
    switch (priority) {
      case 'HAUTE': return 'priority-high';
      case 'MOYENNE': return 'priority-medium';
      case 'BASSE': return 'priority-low';
      default: return '';
    }
  }

  getTaskPriorityText(priority: string): string {
    switch (priority) {
      case 'HAUTE': return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return priority;
    }
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'status-pending';
      case 'PLANIFIE': return 'status-planned';
      case 'EN_COURS': return 'status-in-progress';
      case 'TERMINE': return 'status-completed';
      case 'ANNULE': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'Pending';
      case 'PLANIFIE': return 'Planned';
      case 'EN_COURS': return 'In Progress';
      case 'TERMINE': return 'Completed';
      case 'ANNULE': return 'Cancelled';
      default: return status;
    }
  }

  getProjectsByStatus(status: string): Project[] {
    return this.projects.filter(project => project.statut === status);
  }

  getProjectCount(status: string): number {
    return this.getProjectsByStatus(status).length;
  }

  getTotalBudget(): number {
    return this.projects.reduce((total, project) => total + parseFloat(project.budget || '0'), 0);
  }

  getAverageProgression(): number {
    if (this.projects.length === 0) return 0;
    const total = this.projects.reduce((sum, project) => sum + project.progression, 0);
    return Math.round(total / this.projects.length);
  }

  isOverdue(project: Project): boolean {
    const today = new Date();
    const dueDate = new Date(project.dateFin);
    return dueDate < today && project.statut !== 'TERMINE';
  }

  getDaysUntilDue(project: Project): number {
    const today = new Date();
    const dueDate = new Date(project.dateFin);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Helper method to mark all form controls as touched for validation
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
