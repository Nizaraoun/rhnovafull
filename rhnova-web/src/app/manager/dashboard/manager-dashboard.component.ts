import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagerService, ManagerTask, DetailedTeam, TeamTaskStatistics, TeamMember as ApiTeamMember, MemberTaskCounts } from '../services/manager.service';
import { forkJoin, catchError, of } from 'rxjs';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position: string;
  avatar?: string;
  workload?: number;
  currentTasks?: number;
  completedTasks?: number;
  lastActive?: Date;
  productivity?: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  totalTasks: number;
  completedTasks: number;
  createdDate: Date;
  lastUpdated?: Date;
  averagePerformance?: number;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit {
  dashboardStats = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamMembers: 0,
    pendingLeaveRequests: 0
  };

  recentTasks: ManagerTask[] = [];
  teamDetails: DetailedTeam | null = null;
  currentTeam: Team | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private managerService: ManagerService) { }
  ngOnInit(): void {
    this.loadDashboardData();
  }
  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;    // Load multiple data sources in parallel
    forkJoin({
      teamDetails: this.managerService.getMyTeam().pipe(
        catchError(error => {
          console.error('Error loading team details:', error);
          return of(null);
        })
      ),
      teamTasks: this.managerService.getMyTeamTasks().pipe(
        catchError(error => {
          console.error('Error loading team tasks:', error);
          return of([]);
        })
      ),
      taskStatistics: this.managerService.getTeamTaskStatistics().pipe(
        catchError(error => {
          console.error('Error loading task statistics:', error);
          return of(null);
        })
      )    }).subscribe({      next: (data) => {
        this.teamDetails = data.teamDetails;
        this.recentTasks = data.teamTasks.slice(0, 5); // Show only recent 5 tasks
        
        // Calculate statistics from actual tasks if API statistics are not available
        let calculatedStats = this.calculateTaskStatistics(data.teamTasks);
        
        // Use API statistics if available, otherwise use calculated ones
        const statsToUse = data.taskStatistics || calculatedStats;        // Process team overview data
        if (data.teamDetails) {
          const initialTeam = this.mapApiTeamToTeam(data.teamDetails, statsToUse, data.teamTasks);
          
          // Load member task counts like in team overview
          this.loadMemberTaskCounts(initialTeam, data.teamTasks).then((updatedTeam: Team) => {
            this.currentTeam = updatedTeam;
            console.log('Dashboard team loaded with members:', this.currentTeam?.members?.length || 0);
          }).catch((error: any) => {
            console.error('Error loading member task counts:', error);
            this.currentTeam = initialTeam; // Fallback to basic team data
          });
        }
        
        // Update dashboard stats
        this.dashboardStats = {
          totalTasks: statsToUse.totalTasks,
          completedTasks: statsToUse.completedTasks,
          pendingTasks: statsToUse.pendingTasks,
          teamMembers: data.teamDetails?.membres?.length || 0,
          pendingLeaveRequests: this.generateMockLeaveRequests() // Generate some sample data
        };
        // If no team details loaded, show a fallback message but don't treat as error
        if (!this.teamDetails) {
          console.warn('No team details available - manager may not be assigned to a team');
        }
        
        this.isLoading = false;
      },      error: (error) => {
        console.error('Error loading dashboard data:', error);
        
        // For 403 errors (permission denied), load fallback data instead of showing error
        if (error?.status === 403) {
          console.warn('Permission denied - loading fallback data');
          this.loadFallbackData();
          this.error = null; // Clear error since we're showing fallback data
        } else {
          this.error = 'Failed to load dashboard data. Please try again.';
          this.loadFallbackData(); // Still load fallback data for other errors
        }
        
        this.isLoading = false;
      }
    });
  }

  private calculateTaskStatistics(tasks: ManagerTask[]): TeamTaskStatistics {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.statut === 'TERMINEE').length;
    const inProgressTasks = tasks.filter(task => task.statut === 'EN_COURS').length;
    const pendingTasks = tasks.filter(task => task.statut === 'A_FAIRE').length;
    const overdueTasks = tasks.filter(task => {
      const today = new Date();
      const dueDate = new Date(task.dateFin);
      return dueDate < today && task.statut !== 'TERMINEE';
    }).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks
    };
  }

  private generateMockLeaveRequests(): number {
    // Generate a random number between 0-5 for demonstration
    return Math.floor(Math.random() * 6);
  }  private loadFallbackData(): void {
    // If APIs fail, load some meaningful sample data
    this.dashboardStats = {
      totalTasks: 12,
      completedTasks: 7,
      pendingTasks: 3,
      teamMembers: 5,
      pendingLeaveRequests: 2
    };

    // Sample team details with members
    
  

    this.isLoading = false;
    this.error = null;
  }
  getTaskPriorityClass(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HAUTE': return 'priority-high';
      case 'MOYENNE': return 'priority-medium';
      case 'BASSE': return 'priority-low';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'TERMINEE': return 'status-completed';
      case 'EN_COURS': return 'status-in-progress';
      case 'A_FAIRE': return 'status-pending';
      default: return '';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HAUTE': return 'High';
      case 'MOYENNE': return 'Medium';
      case 'BASSE': return 'Low';
      default: return priority;
    }
  }

  getStatusText(status: string): string {
    switch (status?.toUpperCase()) {
      case 'TERMINEE': return 'Completed';
      case 'EN_COURS': return 'In Progress';
      case 'A_FAIRE': return 'Pending';
      default: return status;
    }
  }
  refreshData(): void {
    console.log('Refreshing dashboard data...');
    this.loadDashboardData();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getCompletionRate(): number {
    if (this.dashboardStats.totalTasks === 0) return 0;
    return Math.round((this.dashboardStats.completedTasks / this.dashboardStats.totalTasks) * 100);
  }

  getTasksInProgress(): number {
    return this.dashboardStats.totalTasks - this.dashboardStats.completedTasks - this.dashboardStats.pendingTasks;
  }

  navigateToTask(taskId: string): void {
    // TODO: Implement navigation to task details
    console.log('Navigate to task:', taskId);
  }

  // Additional utility methods
  getProductivityScore(): string {
    const completionRate = this.getCompletionRate();
    if (completionRate >= 80) return 'Excellent';
    if (completionRate >= 60) return 'Good';
    if (completionRate >= 40) return 'Average';
    return 'Needs Improvement';
  }

  getNextDeadline(): string {
    if (this.recentTasks.length === 0) return 'No upcoming deadlines';
    
    const upcomingTasks = this.recentTasks
      .filter(task => task.statut !== 'TERMINEE')
      .sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime());
    
    if (upcomingTasks.length === 0) return 'No upcoming deadlines';
    
    const nextTask = upcomingTasks[0];
    const daysUntilDeadline = Math.ceil(
      (new Date(nextTask.dateFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline < 0) return `Overdue: ${nextTask.titre}`;
    if (daysUntilDeadline === 0) return `Due Today: ${nextTask.titre}`;
    if (daysUntilDeadline === 1) return `Due Tomorrow: ${nextTask.titre}`;
    return `${daysUntilDeadline} days: ${nextTask.titre}`;
  }

  isOverdue(task: ManagerTask): boolean {
    const today = new Date();
    const dueDate = new Date(task.dateFin);
    return dueDate < today && task.statut !== 'TERMINEE';
  }

  // Team Overview Methods
  private mapApiTeamToTeam(apiTeam: DetailedTeam, teamStats?: TeamTaskStatistics, teamTasks?: any[]): Team {
    if (!apiTeam) {
      throw new Error('Invalid team data received from API');
    }

    // Calculate real task statistics from task data
    const realTaskStats = this.calculateRealTaskStats(teamTasks || []);

    // Ensure membres exists and is an array
    const membres = Array.isArray(apiTeam.membres) ? apiTeam.membres : [];

    return {
      id: apiTeam.id || 'unknown',
      name: apiTeam.nom || 'Équipe sans nom',
      description: apiTeam.description || 'Aucune description disponible',
      totalTasks: realTaskStats.totalTasks || teamStats?.totalTasks || 0,
      completedTasks: realTaskStats.completedTasks || teamStats?.completedTasks || 0,
      createdDate: new Date(),
      lastUpdated: new Date(),
      members: membres.map(member => this.mapApiMemberToMember(member)).filter(member => member !== null) as TeamMember[],
      averagePerformance: this.calculateAveragePerformance(membres)
    };
  }

  private mapApiMemberToMember(apiMember: ApiTeamMember): TeamMember | null {
    if (!apiMember) {
      return null;
    }

    return {
      id: apiMember.id,
      name: apiMember.name,
      email: apiMember.email,
      position: this.translateRole(apiMember.role),
      avatar: undefined,
      workload: undefined,
      currentTasks: undefined,
      completedTasks: undefined,
      lastActive: undefined,
      productivity: undefined
    };
  }

  private translateRole(role: string): string {
    const roleTranslations: { [key: string]: string } = {
      'MEMBRE_EQUIPE': 'Team Member',
      'MANAGER': 'Manager',
      'ADMIN': 'Administrator',
      'TEAM_LEAD': 'Team Lead'
    };
    
    return roleTranslations[role] || role;
  }

  private calculateAveragePerformance(members: ApiTeamMember[]): number {
    if (!members || members.length === 0) return 0;
    return 0; // Will be calculated from real data when available
  }

  private calculateRealTaskStats(teamTasks: any[]) {
    if (!Array.isArray(teamTasks) || teamTasks.length === 0) {
      return { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, pendingTasks: 0 };
    }

    const totalTasks = teamTasks.length;
    const completedTasks = teamTasks.filter(task => task.statut === 'TERMINEE').length;
    const inProgressTasks = teamTasks.filter(task => task.statut === 'EN_COURS').length;
    const pendingTasks = teamTasks.filter(task => task.statut === 'A_FAIRE').length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks
    };
  }

  // Team Overview Template Methods
  getCompletionPercentage(team: Team): number {
    return team.totalTasks > 0 ? Math.round((team.completedTasks / team.totalTasks) * 100) : 0;
  }

  getMostActiveMembers(team: Team): TeamMember[] {
    return team.members
      .filter(member => member.currentTasks !== undefined && member.currentTasks > 0)
      .sort((a, b) => (b.currentTasks || 0) - (a.currentTasks || 0))
      .slice(0, 3);
  }

  getAverageWorkload(team: Team): number {
    if (team.members.length === 0) return 0;
    const validWorkloads = team.members.filter(member => member.workload !== undefined);
    if (validWorkloads.length === 0) return 0;
    const total = validWorkloads.reduce((sum, member) => sum + (member.workload || 0), 0);
    return Math.round(total / validWorkloads.length);
  }

  assignTaskToMember(member: TeamMember): void {
    console.log('Assigning task to member:', member.name);
    // Implementation would navigate to task creation with member pre-selected
  }

  viewMemberDetails(member: TeamMember): void {
    console.log('Viewing member details:', member);
  }

  sendMessageToMember(member: TeamMember): void {
    console.log('Sending message to:', member.name);
  }

  private async loadMemberTaskCounts(team: Team, teamTasks?: any[]): Promise<Team> {
    if (!team.members || team.members.length === 0) {
      console.log('No members to load task counts for');
      return team;
    }

    try {
      console.log('Loading task counts for', team.members.length, 'members using real task data');
      
      // If we have real task data, use it to calculate member statistics
      if (teamTasks && teamTasks.length > 0) {
        console.log('Using real task data for member calculations');
        
        team.members = team.members.map(member => {
          // Calculate task statistics for each member
          const memberTasks = teamTasks.filter(task => task.assigneeId === member.id || task.assignee?.id === member.id);
          const currentTasks = memberTasks.filter(task => task.statut === 'EN_COURS' || task.statut === 'A_FAIRE').length;
          const completedTasks = memberTasks.filter(task => task.statut === 'TERMINEE').length;
          const workload = Math.min(currentTasks * 20, 100); // Rough workload calculation
          const productivity = completedTasks > 0 ? Math.round((completedTasks / (completedTasks + currentTasks)) * 100) : 0;
          
          console.log(`Member ${member.name}: ${currentTasks} current, ${completedTasks} completed tasks`);
          
          return {
            ...member,
            currentTasks,
            completedTasks,
            workload,
            productivity
          };
        });
        
        return team;
      }
      
      // Fallback to API calls if no task data is available
      const memberTaskPromises = team.members.map(member => {
        console.log('Loading task count for member:', member.id);
        return this.managerService.getMemberTaskCounts(member.id).toPromise()
          .catch((error: any) => {
            console.warn(`Failed to load task counts for member ${member.id}:`, error);
            return null; // Return null for failed requests
          });
      });
      
      const memberTaskCounts = await Promise.all(memberTaskPromises);
      
      team.members = team.members.map((member, index) => {
        const taskCounts = memberTaskCounts[index];
        if (taskCounts) {
          console.log('Task counts for', member.name, ':', taskCounts);
          return {
            ...member,
            currentTasks: taskCounts.currentTasks,
            completedTasks: taskCounts.completedTasks,
            workload: Math.min(taskCounts.currentTasks * 20, 100) // Rough workload calculation
          };
        } else {
          console.log('Using calculated values for member:', member.name);
          return member; // Keep calculated values if API call failed
        }
      });
      
      return team;
    } catch (error) {
      console.error('Error loading member task counts:', error);
      return team; // Return team with calculated values if member stats fail
    }
  }
}
