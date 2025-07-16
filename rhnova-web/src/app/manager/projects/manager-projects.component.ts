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
  styles: [`
    .projects-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .header h2 {
      color: #2c3e50;
      margin: 0;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }
    
    .btn-primary {
      background: #3498db;
      color: white;
    }
    
    .btn-primary:hover {
      background: #2980b9;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 1px solid #e1e8ed;
    }
    
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
    }
    
    .modal.show {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .status-pending { color: #f39c12; font-weight: bold; }
    .status-in-progress { color: #3498db; font-weight: bold; }
    .status-completed { color: #27ae60; font-weight: bold; }
    .status-cancelled { color: #e74c3c; font-weight: bold; }
    
    /* Task management styles */
    .task-item {
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background: white;
    }
    
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .task-header h4 {
      margin: 0;
      color: #2c3e50;
    }
    
    .task-badges {
      display: flex;
      gap: 8px;
    }
    
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .badge.status-pending { background: #fff3cd; color: #856404; }
    .badge.status-in-progress { background: #cce5ff; color: #004085; }
    .badge.status-completed { background: #d4edda; color: #155724; }
    
    .badge.priority-high { background: #f8d7da; color: #721c24; }
    .badge.priority-medium { background: #fff3cd; color: #856404; }
    .badge.priority-low { background: #d1ecf1; color: #0c5460; }
    
    .task-description {
      color: #6c757d;
      margin-bottom: 12px;
    }
    
    .task-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    .meta-item {
      color: #6c757d;
    }
    
    .meta-item strong {
      color: #2c3e50;
    }
    
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: #28a745;
      transition: width 0.3s ease;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #2c3e50;
    }
    
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
    
    .error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #6c757d;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }
    
    .tasks-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-close:hover {
      color: #2c3e50;
    }
  `]
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
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      budget: [0, [Validators.required, Validators.min(0)]],
      statut: ['A_FAIRE', Validators.required]
    });
    
    // Add task form
    this.taskForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
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
        this.projects = projects;
        this.filteredProjects = [...this.projects];
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
    // Mock data fallback
    this.projects = [
      {
        id: '1',
        nom: 'RH Nova Web Application',
        description: 'Development of the main HR management web application',
        dateDebut: '2025-01-01',
        dateFin: '2025-06-30',
        budget: 150000,
        statut: 'EN_COURS',
        progression: 65,
        managerId: 'manager1',
        managerName: 'Jean Dupont',
        equipeId: 'team1',
        equipeName: 'Development Team',
        dateCreation: '2025-01-01',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        nom: 'Mobile App Development',
        description: 'Development of the mobile application for RH Nova',
        dateDebut: '2025-02-01',
        dateFin: '2025-08-31',
        budget: 100000,
        statut: 'A_FAIRE',
        progression: 0,
        managerId: 'manager1',
        managerName: 'Jean Dupont',
        dateCreation: '2025-01-15',
        lastUpdated: new Date().toISOString()
      }
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
      statut: 'A_FAIRE',
      budget: 0
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

  // New task management methods
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

  createTaskInProject(): void {
    if (this.taskForm.valid && this.selectedProject) {
      const taskData: CreateTaskRequest = this.taskForm.value;
      
      this.managerService.createTaskInProject(this.selectedProject.id, taskData).subscribe({
        next: (task) => {
          console.log('Task created successfully:', task);
          this.closeCreateTaskModal();
          // Optionally reload project tasks or update the UI
          this.loadProjectTasks(this.selectedProject!.id);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          // Handle error (show toast, etc.)
        }
      });
    }
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
        },
        error: (error) => {
          console.error('Error creating project:', error);
          // Handle error - show toast or alert
        }
      });
    }
  }

  updateProject(): void {
    if (this.projectForm.valid && this.selectedProject) {
      const formData = this.projectForm.value;
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
        },
        error: (error) => {
          console.error('Error updating project:', error);
          // Handle error - show toast or alert
        }
      });
    }
  }

  deleteProject(projectId: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.managerService.deleteProject(projectId).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== projectId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting project:', error);
          // Handle error - show toast or alert
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
            project.equipeName = this.teamDetails!.nom;
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
      case 'A_FAIRE': return 'status-pending';
      case 'EN_COURS': return 'status-in-progress';
      case 'TERMINEE': return 'status-completed';
      case 'ANNULE': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'A_FAIRE': return 'Pending';
      case 'EN_COURS': return 'In Progress';
      case 'TERMINEE': return 'Completed';
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
    return this.projects.reduce((total, project) => total + project.budget, 0);
  }

  getAverageProgression(): number {
    if (this.projects.length === 0) return 0;
    const total = this.projects.reduce((sum, project) => sum + project.progression, 0);
    return Math.round(total / this.projects.length);
  }

  isOverdue(project: Project): boolean {
    const today = new Date();
    const dueDate = new Date(project.dateFin);
    return dueDate < today && project.statut !== 'TERMINEE';
  }

  getDaysUntilDue(project: Project): number {
    const today = new Date();
    const dueDate = new Date(project.dateFin);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  navigateToProjectTasks(projectId: string): void {
    // Navigate to a dedicated project tasks page if needed
    // this.router.navigate(['/manager/projects', projectId, 'tasks']);
  }
}
