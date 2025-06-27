import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ManagerService, ManagerTask, CreateTaskRequest } from '../services/manager.service';

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
  isLoading = false;
  searchTerm = '';
  statusFilter = 'all';
  priorityFilter = 'all';
  showCreateModal = false;
  showEditModal = false;
  selectedTask: Task | null = null;
  
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private managerService: ManagerService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      assignedToId: ['', Validators.required],
      priority: ['Medium', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadTeamMembers();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.managerService.getMyTeamTasks().subscribe({
      next: (apiTasks) => {
        this.tasks = apiTasks.map(apiTask => this.mapApiTaskToTask(apiTask));
        this.filteredTasks = [...this.tasks];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
        // Fallback to mock data if API fails
      }
    });
  }

  private mapApiTaskToTask(apiTask: ManagerTask): Task {
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
      progress: apiTask.progression
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

    loadTeamMembers(): void {
    this.managerService.getMyTeamDetails().subscribe({
      next: (teamDetails) => {
        console.log('Loaded team details:', teamDetails);
        
        try {
          // Handle different response formats
          let members: any[] = [];
          
          if (Array.isArray(teamDetails)) {
            // If teamDetails is an array, get members from the first team
            if (teamDetails.length > 0 && teamDetails[0].membres) {
              members = teamDetails[0].membres;
            } else if (teamDetails.length > 0) {
              // If the array contains member objects directly
              members = teamDetails;
            }
          } else if (teamDetails && teamDetails.membres) {
            // If teamDetails is an object with membres property
            members = teamDetails.membres;
          } else if (teamDetails) {
            // If teamDetails is a single team object
            members = [teamDetails];
          }

          this.teamMembers = members.map(member => ({
            id: member.id || member.userId,
            name: member.name || member.nom || `${member.prenom || ''} ${member.nom || ''}`.trim() || member.username,
            email: member.email,
            role: member.role || 'TEAM_MEMBER'
          })).filter(member => member.id && member.name); // Filter out invalid members
          
          console.log('Mapped team members:', this.teamMembers);
        } catch (mappingError) {
          console.error('Error mapping team members:', mappingError);
          this.teamMembers = [];
        }
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        // Try alternative endpoint
        this.tryAlternativeTeamEndpoint();
      }
    });
  }

  private tryAlternativeTeamEndpoint(): void {
    console.log('Trying alternative team endpoint...');
    this.managerService.getMyTeam().subscribe({
      next: (teamData) => {
        console.log('Alternative team data:', teamData);
        if (teamData && teamData.membres) {
          this.teamMembers = teamData.membres.map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role || 'TEAM_MEMBER'
          }));
        }
      },
      error: (altError) => {
        console.error('Alternative endpoint also failed:', altError);
        // Final fallback to empty array
        this.teamMembers = [];
      }
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           task.assignedTo.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || task.status === this.statusFilter;
      const matchesPriority = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
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
    this.taskForm.reset();
    this.taskForm.patchValue({ priority: 'Medium' });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.taskForm.reset();
  }

  openEditModal(task: Task): void {
    this.selectedTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      assignedToId: task.assignedToId,
      priority: task.priority,
      dueDate: task.dueDate.toISOString().split('T')[0]
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedTask = null;
    this.taskForm.reset();
  }

  createTask(): void {
    if (this.taskForm.valid) {
      const formData = this.taskForm.value;
      
      const createTaskRequest: CreateTaskRequest = {
        titre: formData.title,
        description: formData.description,
        priorite: this.mapUIPriorityToApiPriority(formData.priority),
        dateDebut: new Date().toISOString().split('T')[0], // Today
        dateFin: formData.dueDate
      };

      this.managerService.createTask(createTaskRequest).subscribe({
        next: (createdTask) => {
          const newTask = this.mapApiTaskToTask(createdTask);
          
          // If we want to assign it immediately
          if (formData.assignedToId) {
            this.managerService.assignTask(createdTask.id, formData.assignedToId).subscribe({
              next: () => {
                this.loadTasks(); // Reload to get updated task with assignment
              },
              error: (error) => {
                console.error('Error assigning task:', error);
                this.tasks.push(newTask);
                this.applyFilters();
              }
            });
          } else {
            this.tasks.push(newTask);
            this.applyFilters();
          }
          
          this.closeCreateModal();
        },
        error: (error) => {
          console.error('Error creating task:', error);
          // Fallback to local creation
          this.createTaskLocally(formData);
        }
      });
    }
  }

  private createTaskLocally(formData: any): void {
    const assignedMember = this.teamMembers.find(member => member.id === formData.assignedToId);
    
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
      progress: 0
    };

    this.tasks.push(newTask);
    this.applyFilters();
    this.closeCreateModal();
  }

  updateTask(): void {
    if (this.taskForm.valid && this.selectedTask) {
      const formData = this.taskForm.value;
      const assignedMember = this.teamMembers.find(member => member.id === formData.assignedToId);
      
      this.selectedTask.title = formData.title;
      this.selectedTask.description = formData.description;
      this.selectedTask.assignedTo = assignedMember?.name || '';
      this.selectedTask.assignedToId = formData.assignedToId;
      this.selectedTask.priority = formData.priority;
      this.selectedTask.dueDate = new Date(formData.dueDate);

      this.applyFilters();
      this.closeEditModal();
      
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
}
