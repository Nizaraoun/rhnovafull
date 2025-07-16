import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ManagerService, ManagerTask, CreateTaskRequest, Project } from '../services/manager.service';
import { forkJoin } from 'rxjs';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToId: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  createdDate: Date;
  progress: number;
  projectId: string; // Required for project-based tasks
  projectName?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-manager-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manager-tasks.component.html',
  styleUrls: ['./manager-tasks.component.scss']
})
export class ManagerTasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  teamMembers: TeamMember[] = [];
  projects: Project[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = 'all';
  priorityFilter = 'all';
  projectFilter = 'all';
  showCreateModal = false;
  showEditModal = false;
  selectedTask: Task | null = null;
  isCreatingTask = false;
  isUpdatingTask = false;
  
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private managerService: ManagerService,
    private cdr: ChangeDetectorRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      assignedToId: ['', Validators.required], // Make sure this is required
      priority: ['Medium', Validators.required],
      dueDate: ['', Validators.required],
      projectId: ['', Validators.required] // Add project selection
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Load projects and team members in parallel
    forkJoin({
      projects: this.managerService.getMyProjects(),
      teamMembers: this.managerService.getMyTeamDetails()
    }).subscribe({
      next: ({ projects, teamMembers }) => {
        this.projects = projects;
        this.loadTeamMembersFromResponse(teamMembers);
        
        // Load tasks from all projects
        this.loadTasksFromAllProjects();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
      }
    });
  }

  loadTasksFromAllProjects(): void {
    if (this.projects.length === 0) {
      this.tasks = [];
      this.filteredTasks = [];
      this.isLoading = false;
      return;
    }

    // Get tasks from all projects
    const taskRequests = this.projects.map(project => 
      this.managerService.getProjectTasks(project.id)
    );

    forkJoin(taskRequests).subscribe({
      next: (projectTasks) => {
        this.tasks = [];
        
        // Flatten all project tasks into a single array
        projectTasks.forEach((tasks, index) => {
          const project = this.projects[index];
          tasks.forEach(apiTask => {
            const task = this.mapApiTaskToTask(apiTask, project);
            this.tasks.push(task);
          });
        });
        
        this.filteredTasks = [...this.tasks];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  private loadTeamMembersFromResponse(teamDetails: any): void {
    try {
      let members: any[] = [];
      
      console.log('Raw team details:', teamDetails);
      
      if (Array.isArray(teamDetails)) {
        if (teamDetails.length > 0 && teamDetails[0].membres) {
          members = teamDetails[0].membres;
        }
      } else if (teamDetails && teamDetails.membres) {
        members = teamDetails.membres;
      }

      console.log('Raw members:', members);

      this.teamMembers = members.map(member => ({
        id: member.id || member.userId,
        name: member.name || member.nom || `${member.prenom || ''} ${member.nom || ''}`.trim() || member.username,
        email: member.email,
        role: member.role || 'TEAM_MEMBER'
      })).filter(member => member.id && member.name);
      
      console.log('Mapped team members:', this.teamMembers);
    } catch (error) {
      console.error('Error mapping team members:', error);
      this.teamMembers = [];
    }
  }

  private mapApiTaskToTask(apiTask: ManagerTask, project: Project): Task {
    return {
      id: apiTask.id,
      title: apiTask.titre,
      description: apiTask.description,
      assignedTo: apiTask.membreName || 'Unassigned',
      assignedToId: apiTask.membreId || '',
      status: this.mapApiStatusToUIStatus(apiTask.statut),
      priority: this.mapApiPriorityToUIPriority(apiTask.priorite),
      dueDate: new Date(apiTask.dateFin),
      createdDate: new Date(apiTask.dateCreation),
      progress: apiTask.progression,
      projectId: project.id,
      projectName: project.nom
    };
  }

  private mapApiStatusToUIStatus(apiStatus: string): 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' {
    switch (apiStatus) {
      case 'A_FAIRE': return 'Pending';
      case 'EN_COURS': return 'In Progress';
      case 'TERMINEE': return 'Completed';
      default: return 'Pending';
    }
  }

  private mapApiPriorityToUIPriority(apiPriority: string): 'Low' | 'Medium' | 'High' {
    switch (apiPriority) {
      case 'BASSE': return 'Low';
      case 'MOYENNE': return 'Medium';
      case 'HAUTE': return 'High';
      default: return 'Medium';
    }
  }

  private mapUIPriorityToApiPriority(uiPriority: string): 'BASSE' | 'MOYENNE' | 'HAUTE' {
    switch (uiPriority) {
      case 'Low': return 'BASSE';
      case 'Medium': return 'MOYENNE';
      case 'High': return 'HAUTE';
      default: return 'MOYENNE';
    }
  }

  applyFilters(): void {
    // Early exit if no tasks
    if (this.tasks.length === 0) {
      this.filteredTasks = [];
      return;
    }

    // Cache search term for performance
    const searchTermLower = this.searchTerm.toLowerCase();
    
    this.filteredTasks = this.tasks.filter(task => {
      // Search filter
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(searchTermLower) ||
        task.assignedTo.toLowerCase().includes(searchTermLower) ||
        (task.projectName && task.projectName.toLowerCase().includes(searchTermLower));
      
      // Status filter
      const matchesStatus = this.statusFilter === 'all' || task.status === this.statusFilter;
      
      // Priority filter
      const matchesPriority = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
      
      // Project filter
      const matchesProject = this.projectFilter === 'all' || task.projectId === this.projectFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  getTaskCount(status: string): number {
    return this.getTasksByStatus(status).length;
  }

  getTotalTasks(): number {
    return this.tasks.length;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'in progress': return 'status-in-progress';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  openCreateModal(): void {
    // Reset form first
    this.taskForm.reset();
    this.taskForm.patchValue({ priority: 'Medium' });
    
    // Use setTimeout to prevent lag
    setTimeout(() => {
      this.showCreateModal = true;
      this.cdr.detectChanges();
    }, 0);
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.taskForm.reset();
  }

  openEditModal(task: Task): void {
    this.selectedTask = task;
    
    // Patch form values
    this.taskForm.patchValue({
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      assignedToId: task.assignedToId,
      priority: task.priority,
      dueDate: task.dueDate.toISOString().split('T')[0]
    });
    
    // Use setTimeout to prevent lag
    setTimeout(() => {
      this.showEditModal = true;
      this.cdr.detectChanges();
    }, 0);
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedTask = null;
    this.taskForm.reset();
  }

  createTask(): void {
    if (this.taskForm.valid) {
      this.isCreatingTask = true;
      const formData = this.taskForm.value;
      
      // Debug logging
      console.log('Form data:', formData);
      console.log('assignedToId from form:', formData.assignedToId);
      console.log('Team members available:', this.teamMembers);
      
      const selectedProject = this.projects.find(p => p.id === formData.projectId);
      
      if (!selectedProject) {
        console.error('No project selected');
        this.isCreatingTask = false;
        return;
      }
      
   
      
      const createTaskRequest: CreateTaskRequest = {
        titre: formData.title,
        description: formData.description,
        priorite: this.mapUIPriorityToApiPriority(formData.priority),
        dateDebut: new Date().toISOString().split('T')[0], // Today
        dateFin: formData.dueDate,
        statut: 'A_FAIRE',
        assigneeId: formData.assignedToId,
        membreId: formData.assignedToId // Send both field names for compatibility
      };

      console.log('Final task request:', createTaskRequest);

      this.managerService.createTaskInProject(formData.projectId, createTaskRequest).subscribe({
        next: (createdTask) => {
          const newTask = this.mapApiTaskToTask(createdTask, selectedProject);
          this.tasks.push(newTask);
          this.applyFilters();
          this.isCreatingTask = false;
          this.closeCreateModal();
        },
        error: (error) => {
          console.error('Error creating task:', error);
          // Fallback to local creation
          this.createTaskLocally(formData);
          this.isCreatingTask = false;
        }
      });
    }
  }

  private createTaskLocally(formData: any): void {
    const assignedMember = this.teamMembers.find(member => member.id === formData.assignedToId);
    const selectedProject = this.projects.find(p => p.id === formData.projectId);
    
    const newTask: Task = {
      id: (this.tasks.length + 1).toString(),
      title: formData.title,
      description: formData.description,
      assignedTo: assignedMember?.name || '',
      assignedToId: formData.assignedToId || '',
      status: 'Pending',
      priority: formData.priority,
      dueDate: new Date(formData.dueDate),
      createdDate: new Date(),
      progress: 0,
      projectId: formData.projectId,
      projectName: selectedProject?.nom || ''
    };

    this.tasks.push(newTask);
    this.applyFilters();
    this.closeCreateModal();
  }

  updateTask(): void {
    if (this.taskForm.valid && this.selectedTask) {
      this.isUpdatingTask = true;
      const formData = this.taskForm.value;
      const assignedMember = this.teamMembers.find(member => member.id === formData.assignedToId);
      const selectedProject = this.projects.find(p => p.id === formData.projectId);
      
      this.selectedTask.title = formData.title;
      this.selectedTask.description = formData.description;
      this.selectedTask.assignedTo = assignedMember?.name || '';
      this.selectedTask.assignedToId = formData.assignedToId;
      this.selectedTask.priority = formData.priority;
      this.selectedTask.dueDate = new Date(formData.dueDate);
      this.selectedTask.projectId = formData.projectId;
      this.selectedTask.projectName = selectedProject?.nom || '';

      // Simulate API call delay
      setTimeout(() => {
        this.applyFilters();
        this.isUpdatingTask = false;
        this.closeEditModal();
      }, 500);
      
      // TODO: Call actual service to update task
      console.log('Updating task:', this.selectedTask);
    }
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.managerService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          // Fallback to local deletion
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.applyFilters();
        }
      });
    }
  }

  changeTaskStatus(taskId: string, newStatus: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus as any;
      
      // Auto-adjust progress based on status
      if (newStatus === 'Pending') {
        task.progress = 0;
      } else if (newStatus === 'Completed') {
        task.progress = 100;
      } else if (newStatus === 'In Progress' && task.progress === 0) {
        task.progress = 10;
      }
      
      this.applyFilters();
      
      // TODO: Call actual service to update task status
      console.log('Updating task status:', taskId, newStatus);
    }
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }

  trackByMemberId(index: number, member: TeamMember): string {
    return member.id;
  }
}
