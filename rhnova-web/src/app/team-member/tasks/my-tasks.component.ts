/*
 * READY FOR NEW TASK-PROJECT RELATIONSHIP
 * 
 * This component is already prepared for the new architecture where tasks are associated with projects:
 * - Task interface includes projectId and projectName fields
 * - Component can display project information alongside task details
 * - Team member can see which project each task belongs to
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeamMemberService, TeamMemberTask } from '../services/team-member.service';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  assignedBy: string;
  progress: number;
  comments: string[];
  projectId: string; // Now required since tasks are always part of a project
  projectName?: string;
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss']
})
export class MyTasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchTerm = '';
  statusFilter = 'all';
  priorityFilter = 'all';
  isLoading = false;
  
  selectedTask: Task | null = null;
  showUpdateModal = false;
  newProgress = 0;
  newComment = '';

  constructor(private teamMemberService: TeamMemberService) { }

  ngOnInit(): void {
    this.loadMyTasks();
  }
  loadMyTasks(): void {
    this.isLoading = true;
    this.teamMemberService.getMyTasks().subscribe({
      next: (apiTasks) => {
        this.tasks = apiTasks.map(apiTask => this.mapApiTaskToTask(apiTask));
        this.filteredTasks = [...this.tasks];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
        // Fallback to mock data if API fails
        this.loadMockTasks();
      }
    });
  }

  private mapApiTaskToTask(apiTask: TeamMemberTask): Task {
    return {
      id: apiTask.id,
      title: apiTask.titre,
      description: apiTask.description,
      status: this.mapApiStatusToUIStatus(apiTask.statut),
      priority: this.mapApiPriorityToUIPriority(apiTask.priorite),
      dueDate: new Date(apiTask.dateFin),
      assignedBy: apiTask.createdByName,
      progress: apiTask.progression,
      comments: [], // Comments will be managed separately or fetched from another endpoint
      projectId: apiTask.projetId,
      projectName: apiTask.projetName
    };
  }

  private mapApiStatusToUIStatus(apiStatus: string): 'Pending' | 'In Progress' | 'Completed' {
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

  private mapUIStatusToApiStatus(uiStatus: string): string {
    switch (uiStatus) {
      case 'Pending': return 'A_FAIRE';
      case 'In Progress': return 'EN_COURS';
      case 'Completed': return 'TERMINEE';
      default: return 'A_FAIRE';
    }
  }

  private loadMockTasks(): void {
    // Mock data fallback

    this.filteredTasks = [...this.tasks];
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(this.searchTerm.toLowerCase());
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

  openUpdateModal(task: Task): void {
    this.selectedTask = task;
    this.newProgress = task.progress;
    this.newComment = '';
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedTask = null;
    this.newProgress = 0;
    this.newComment = '';
  }
  updateTaskProgress(): void {
    if (this.selectedTask) {
      this.teamMemberService.updateTaskProgress(this.selectedTask.id, this.newProgress).subscribe({
        next: (updatedApiTask) => {
          // Update the local task
          const updatedTask = this.mapApiTaskToTask(updatedApiTask);
          const index = this.tasks.findIndex(t => t.id === this.selectedTask!.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          
          // Add comment if provided
          if (this.newComment.trim()) {
            this.tasks[index].comments.push(this.newComment.trim());
          }

          this.applyFilters();
          this.closeUpdateModal();
        },
        error: (error) => {
          console.error('Error updating task progress:', error);
          // Fallback to local update if API fails
          this.updateTaskProgressLocally();
        }
      });
    }
  }

  private updateTaskProgressLocally(): void {
    if (this.selectedTask) {
      this.selectedTask.progress = this.newProgress;
      
      // Update status based on progress
      if (this.newProgress === 0) {
        this.selectedTask.status = 'Pending';
      } else if (this.newProgress === 100) {
        this.selectedTask.status = 'Completed';
      } else {
        this.selectedTask.status = 'In Progress';
      }
      
      // Add comment if provided
      if (this.newComment.trim()) {
        this.selectedTask.comments.push(this.newComment.trim());
      }

      this.applyFilters();
      this.closeUpdateModal();
    }
  }
  updateTaskStatus(taskId: string, newStatus: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      const apiStatus = this.mapUIStatusToApiStatus(newStatus);
      
      this.teamMemberService.updateTaskStatus(taskId, apiStatus).subscribe({
        next: (updatedApiTask) => {
          // Update the local task with API response
          const updatedTask = this.mapApiTaskToTask(updatedApiTask);
          const index = this.tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          // Fallback to local update if API fails
          this.updateTaskStatusLocally(task, newStatus);
        }
      });
    }
  }

  private updateTaskStatusLocally(task: Task, newStatus: string): void {
    task.status = newStatus as any;
    
    // Auto-adjust progress based on status
    if (newStatus === 'Pending') {
      task.progress = 0;
    } else if (newStatus === 'Completed') {
      task.progress = 100;
    } else if (newStatus === 'In Progress' && task.progress === 0) {
      task.progress = 10; // Give it a small start
    }
    
    this.applyFilters();
  }

  isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate);
  }

  getDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
