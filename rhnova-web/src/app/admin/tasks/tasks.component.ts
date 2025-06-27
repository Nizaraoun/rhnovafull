import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from './task.service';
import { AuthService } from '../../auth/services/auth.service';
import { Role } from '../../shared/models/role.model';

interface DisplayTask {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: Date;
  createdDate: Date;
  progression?: number;
  evaluation?: number;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  tasks: DisplayTask[] = [];
  filteredTasks: DisplayTask[] = [];
  selectedStatus = '';
  selectedPriority = '';
  searchTerm = '';
  statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
  showCreateModal = false;
  showEditModal = false;
  editingTask: DisplayTask | null = null;
  newTask: Partial<DisplayTask> = {
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: new Date()
  };  loading = false;
  error = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}  ngOnInit() {
    console.log('TasksComponent initialized');
    
    // Check if user is admin
    const userRole = this.authService.getUserRole();
    if (userRole !== Role.ADMIN) {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.taskService.getAllTasks().subscribe({
      next: (apiTasks) => {
        console.log('Tasks loaded successfully:', apiTasks);
        this.tasks = apiTasks.map(task => this.convertApiTaskToDisplay(task));
        this.filterTasks();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load tasks';
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  convertApiTaskToDisplay(apiTask: Task): DisplayTask {
    return {
      id: apiTask.id,
      title: apiTask.titre,
      description: apiTask.description,
      status: this.mapApiStatusToDisplay(apiTask.statut),
      priority: this.mapApiPriorityToDisplay(apiTask.priorite),
      assignee: apiTask.membreId,
      dueDate: new Date(apiTask.dateFin),
      createdDate: new Date(apiTask.dateDebut),
      progression: apiTask.progression,
      evaluation: apiTask.evaluation
    };
  }

  convertDisplayTaskToApi(displayTask: DisplayTask): Omit<Task, 'id'> {
    return {
      titre: displayTask.title,
      description: displayTask.description,
      statut: this.mapDisplayStatusToApi(displayTask.status),
      priorite: this.mapDisplayPriorityToApi(displayTask.priority),
      membreId: displayTask.assignee,
      dateFin: displayTask.dueDate.toISOString().split('T')[0],
      dateDebut: displayTask.createdDate.toISOString().split('T')[0],
      progression: displayTask.progression || 0,
      evaluation: displayTask.evaluation || 0
    };
  }

  mapApiStatusToDisplay(apiStatus: string): 'pending' | 'in-progress' | 'completed' {
    switch (apiStatus) {
      case 'A_FAIRE': return 'pending';
      case 'EN_COURS': return 'in-progress';
      case 'TERMINEE': return 'completed';
      default: return 'pending';
    }
  }

  mapDisplayStatusToApi(displayStatus: string): 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' {
    switch (displayStatus) {
      case 'pending': return 'A_FAIRE';
      case 'in-progress': return 'EN_COURS';
      case 'completed': return 'TERMINEE';
      default: return 'A_FAIRE';
    }
  }

  mapApiPriorityToDisplay(apiPriority: string): 'low' | 'medium' | 'high' {
    switch (apiPriority) {
      case 'BASSE': return 'low';
      case 'MOYENNE': return 'medium';
      case 'HAUTE': return 'high';
      default: return 'medium';
    }
  }

  mapDisplayPriorityToApi(displayPriority: string): 'HAUTE' | 'MOYENNE' | 'BASSE' {
    switch (displayPriority) {
      case 'low': return 'BASSE';
      case 'medium': return 'MOYENNE';
      case 'high': return 'HAUTE';
      default: return 'MOYENNE';
    }
  }
  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus = !this.selectedStatus || task.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || task.priority === this.selectedPriority;
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }

  getTasksByStatus(status: string): DisplayTask[] {
    return this.filteredTasks.filter(task => task.status === status);
  }

  getTaskCount(status: string): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  getTotalTasks(): number {
    return this.tasks.length;
  }

  getStatusTitle(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  }
  openCreateTaskModal() {
    this.showCreateModal = true;
    this.newTask = {
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      dueDate: new Date()
    };
  }

  closeCreateTaskModal() {
    this.showCreateModal = false;
  }

  createTask() {
    if (this.newTask.title && this.newTask.assignee) {
      const displayTask: DisplayTask = {
        title: this.newTask.title,
        description: this.newTask.description || '',
        status: 'pending',
        priority: this.newTask.priority as 'low' | 'medium' | 'high',
        assignee: this.newTask.assignee,
        dueDate: this.newTask.dueDate || new Date(),
        createdDate: new Date(),
        progression: 0,
        evaluation: 0
      };
      
      const apiTask = this.convertDisplayTaskToApi(displayTask);
      
      this.loading = true;
      this.taskService.createTask(apiTask).subscribe({
        next: (createdTask) => {
          this.tasks.push(this.convertApiTaskToDisplay(createdTask));
          this.filterTasks();
          this.closeCreateTaskModal();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to create task';
          console.error('Error creating task:', error);
          this.loading = false;
        }
      });
    }
  }

  editTask(task: DisplayTask) {
    this.editingTask = { ...task };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTask = null;
  }

  updateTask() {
    if (this.editingTask && this.editingTask.id) {
      const apiTask = this.convertDisplayTaskToApi(this.editingTask);
      
      this.loading = true;
      this.taskService.updateTask(this.editingTask.id, apiTask).subscribe({
        next: (updatedTask) => {
          const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
          if (index !== -1) {
            this.tasks[index] = this.convertApiTaskToDisplay(updatedTask);
          }
          this.filterTasks();
          this.closeEditModal();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to update task';
          console.error('Error updating task:', error);
          this.loading = false;
        }
      });
    }
  }

  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.filterTasks();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to delete task';
          console.error('Error deleting task:', error);
          this.loading = false;
        }
      });
    }
  }

  updateTaskStatus(taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') {
    const apiStatus = this.mapDisplayStatusToApi(newStatus);
    
    this.taskService.updateTaskStatus(taskId, apiStatus).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = this.convertApiTaskToDisplay(updatedTask);
        }
        this.filterTasks();
      },
      error: (error) => {
        this.error = 'Failed to update task status';
        console.error('Error updating task status:', error);
      }
    });
  }

  updateTaskProgression(taskId: string, progression: number) {
    this.taskService.updateTaskProgression(taskId, progression).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = this.convertApiTaskToDisplay(updatedTask);
        }
        this.filterTasks();
      },
      error: (error) => {
        this.error = 'Failed to update task progression';
        console.error('Error updating task progression:', error);
      }
    });
  }
}
