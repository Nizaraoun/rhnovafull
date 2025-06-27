import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerService, DetailedTeam, TeamMember as ApiTeamMember, TeamTaskStatistics, MemberTaskCounts } from '../services/manager.service';
import { forkJoin, interval, Subject, timer, of, EMPTY } from 'rxjs';
import { takeUntil, switchMap, startWith, catchError } from 'rxjs/operators';

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
  selector: 'app-team-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './team-overview.component.html',
  styleUrls: ['./team-overview.component.scss']
})
export class TeamOverviewComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  selectedTeam: Team | null = null;
  isLoading = false;
  error: string | null = null;
  lastUpdateTime: Date = new Date();
  autoRefresh = true;
  refreshInterval = 30000; // 30 seconds
  
  // Filtering and sorting
  sortBy: 'name' | 'performance' | 'workload' | 'tasks' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';
  
  private destroy$ = new Subject<void>();
  private refreshTimer$ = new Subject<void>();
  
  constructor(
    private managerService: ManagerService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.loadTeams();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshTimer$.next();
    this.refreshTimer$.complete();
  }

  private setupAutoRefresh(): void {
    if (this.autoRefresh) {
      timer(this.refreshInterval, this.refreshInterval)
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => this.loadTeamsData())
        )
        .subscribe({
          next: (data) => {
            this.updateTeamsData(data);
            this.lastUpdateTime = new Date();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Auto-refresh error:', error);
          }
        });
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    } else {
      this.refreshTimer$.next();
    }
  }

  refreshData(): void {
    this.loadTeams();
  }  loadTeams(): void {
    this.isLoading = true;
    this.error = null;
    console.log('🔄 Loading teams from API...');
    
    this.loadTeamsData().subscribe({
      next: (data) => {
        console.log('✅ Team data received:', data);
        
        // Check if we received valid data
        if (data.teamDetails) {
          console.log('📊 Processing team details:', data.teamDetails);
          console.log('📈 Team stats:', data.teamStats);
          
          try {
            this.updateTeamsData(data);
            this.isLoading = false;
            this.lastUpdateTime = new Date();
            console.log('✅ Teams successfully loaded and processed');          } catch (error) {
            console.error('❌ Error processing team data:', error);
            this.error = 'Erreur lors du traitement des données d\'équipe';
            this.isLoading = false;
          }        } else {
          console.warn('⚠️ No team details received from API');
          this.isLoading = false;
          this.error = 'Aucune donnée d\'équipe disponible';
        }
      },
      error: (error) => {
        console.error('❌ API Error loading teams:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
          this.error = `Erreur API: ${error.status || 'Connexion'} - ${error.statusText || 'Impossible de charger les équipes'}`;
        this.isLoading = false;
      }
    });
  }  private loadTeamsData() {
    // Load team details, statistics, and actual task data in parallel
    return forkJoin({
      teamDetails: this.managerService.getMyTeam().pipe(
        catchError((error: any) => {
          console.error('Error loading team details:', error);
          return of(null);
        })
      ),
      teamStats: this.managerService.getTeamTaskStatistics().pipe(
        catchError((error: any) => {
          console.error('Error loading team stats:', error);
          return of({ totalTasks: 0, completedTasks: 0, inProgressTasks: 0, pendingTasks: 0, overdueTasks: 0 });
        })
      ),
      teamTasks: this.managerService.getMyTeamTasks().pipe(
        catchError((error: any) => {
          console.error('Error loading team tasks:', error);
          return of([]);
        })
      )
    });
  }  private updateTeamsData({ teamDetails, teamStats, teamTasks }: { teamDetails: DetailedTeam | null, teamStats: TeamTaskStatistics, teamTasks: any[] }): void {
    console.log('Raw team details:', teamDetails);
    console.log('Raw team stats:', teamStats);
    console.log('Raw team tasks:', teamTasks);
      // Check if teamDetails is valid
    if (!teamDetails) {
      console.error('No team details received from API');
      this.teams = [];
      this.selectedTeam = null;
      return;
    }

    const team = this.mapApiTeamToTeam(teamDetails, teamStats, teamTasks);
    
    // Load individual member task counts using real task data
    this.loadMemberTaskCounts(team, teamTasks).then(updatedTeam => {
      this.teams = [updatedTeam];
      if (!this.selectedTeam || this.selectedTeam.id === updatedTeam.id) {
        this.selectedTeam = updatedTeam;
      }
      this.cdr.detectChanges();
    });
  }  private async loadMemberTaskCounts(team: Team, teamTasks?: any[]): Promise<Team> {
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
          const memberTasks = teamTasks.filter(task => task.membreId === member.id);
          const currentTasks = memberTasks.filter(task => task.statut === 'EN_COURS').length;
          const completedTasks = memberTasks.filter(task => task.statut === 'TERMINEE').length;
          const totalTasks = memberTasks.length;
          
          // Calculate workload based on task count and complexity
          const workload = Math.min(currentTasks * 20, 100); // Assume each current task = 20% workload
          
          // Calculate productivity based on completion rate
          const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 50;
          
          console.log(`Member ${member.name} stats:`, {
            currentTasks,
            completedTasks,
            totalTasks,
            workload,
            productivity
          });
          
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
          .catch(error => {
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
        } else {          console.log('Using calculated values for member:', member.name);
          return member; // Keep calculated values if API call failed
        }
      });
      
      return team;
    } catch (error) {
      console.error('Error loading member task counts:', error);
      return team; // Return team with calculated values if member stats fail
    }
  }  private mapApiTeamToTeam(apiTeam: DetailedTeam, teamStats?: TeamTaskStatistics, teamTasks?: any[]): Team {
    console.log('Mapping API team:', apiTeam);
    console.log('Using task data for calculations:', teamTasks?.length || 0, 'tasks');
    
    // Handle case where apiTeam might be null or undefined
    if (!apiTeam) {
      console.error('API team is null or undefined');
      throw new Error('Invalid team data received from API');
    }

    // Calculate real task statistics from task data
    const realTaskStats = this.calculateRealTaskStats(teamTasks || []);
    console.log('Real task statistics:', realTaskStats);

    // Ensure membres exists and is an array - handle the exact API structure
    const membres = Array.isArray(apiTeam.membres) ? apiTeam.membres : [];
    console.log('Team members:', membres);
    console.log('Team manager:', apiTeam.manager);
    console.log('Number of members:', apiTeam.nombreMembres || membres.length);

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
  }  private mapApiMemberToMember(apiMember: ApiTeamMember): TeamMember | null {
    if (!apiMember) {
      console.warn('API member is null or undefined');
      return null;
    }    console.log('Mapping member:', apiMember);    return {
      id: apiMember.id,
      name: apiMember.name,
      email: apiMember.email,
      position: this.translateRole(apiMember.role),
      avatar: undefined, // No avatar - handle in template
      workload: undefined, // Will be calculated from real task data
      currentTasks: undefined, // Will be calculated from real task data
      completedTasks: undefined, // Will be calculated from real task data
      lastActive: undefined, // Will be updated with real data when available
      productivity: undefined // Will be calculated from real task data
    };
  }
  private translateRole(role: string): string {
    const roleTranslations: { [key: string]: string } = {
      'MEMBRE_EQUIPE': 'Membre d\'équipe',
      'MANAGER': 'Manager',
      'ADMIN': 'Administrateur',
      'TEAM_LEAD': 'Chef d\'équipe'
    };
    
    return roleTranslations[role] || role;
  }  private calculateAveragePerformance(members: ApiTeamMember[]): number {
    if (!members || members.length === 0) return 0;
    // Return 0 since we don't have real performance metrics yet
    return 0; // Will be calculated from real data when available
  }  selectTeam(team: Team): void {
    this.selectedTeam = team;
  }

  getCompletionPercentage(team: Team): number {
    return team.totalTasks > 0 ? Math.round((team.completedTasks / team.totalTasks) * 100) : 0;
  }
  getStatusClass(status: string): string {
    // Status classes removed - no status data available
    return '';
  }
  getWorkloadColor(workload: number | undefined): string {
    if (!workload) return '#cccccc'; // Gray for undefined workload
    if (workload >= 80) return '#e74c3c';
    if (workload >= 60) return '#f39c12';
    return '#27ae60';
  }
  getAverageWorkload(team: Team): number {
    if (team.members.length === 0) return 0;
    const validWorkloads = team.members.filter(member => member.workload !== undefined);
    if (validWorkloads.length === 0) return 0;
    const total = validWorkloads.reduce((sum, member) => sum + (member.workload || 0), 0);
    return Math.round(total / validWorkloads.length);
  }
  // Helper methods for template
  getMembersCount(team: Team): number {
    if (!team || !team.members) return 0;
    return team.members.length;
  }
  // Safe event handler for search input
  onSearchInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.searchTerm = target.value;
    }
  }
  onSearchChange(term: string): void {
    this.searchTerm = term;
  }

  // Filtering and sorting methods
  getFilteredTeams(): Team[] {
    let filtered = this.teams;
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        team.members.some(member => 
          member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (this.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'performance':
          valueA = a.averagePerformance || 0;
          valueB = b.averagePerformance || 0;
          break;
        case 'workload':
          valueA = this.getAverageWorkload(a);
          valueB = this.getAverageWorkload(b);
          break;
        case 'tasks':
          valueA = a.totalTasks;
          valueB = b.totalTasks;
          break;
        default:
          return 0;
      }
      
      if (this.sortDirection === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
    
    return filtered;
  }

  sortTeams(criterion: 'name' | 'performance' | 'workload' | 'tasks'): void {
    if (this.sortBy === criterion) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = criterion;
      this.sortDirection = 'asc';
    }
  }
  // Performance metrics
  getMostActiveMembers(team: Team): TeamMember[] {
    return team.members
      .filter(member => member.currentTasks !== undefined && member.currentTasks > 0)
      .sort((a, b) => (b.currentTasks || 0) - (a.currentTasks || 0))
      .slice(0, 3);
  }
  // Time-based insights
  getTimeSinceLastUpdate(): string {
    const now = new Date();
    const diff = now.getTime() - this.lastUpdateTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes === 1) return 'Il y a 1 minute';
    if (minutes < 60) return `Il y a ${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Il y a 1 heure';
    return `Il y a ${hours} heures`;
  }

  // Enhanced member interactions
  assignTaskToMember(member: TeamMember): void {
    // Navigate to task assignment with pre-selected member
    console.log('Assigning task to member:', member.name);
    // Implementation would navigate to task creation with member pre-selected
  }

  viewMemberDetails(member: TeamMember): void {
    // Show detailed member information in a modal or navigate to member profile
    console.log('Viewing member details:', member);
  }

  sendMessageToMember(member: TeamMember): void {
    // Open messaging interface or integrate with communication tools
    console.log('Sending message to:', member.name);  }

  // Debug method to test API directly
  
  // Calculate real task statistics from actual task data
  private calculateRealTaskStats(teamTasks: any[]) {
    if (!Array.isArray(teamTasks) || teamTasks.length === 0) {
      return { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, pendingTasks: 0 };
    }

    const totalTasks = teamTasks.length;
    const completedTasks = teamTasks.filter(task => task.statut === 'TERMINEE').length;
    const inProgressTasks = teamTasks.filter(task => task.statut === 'EN_COURS').length;
    const pendingTasks = teamTasks.filter(task => task.statut === 'A_FAIRE').length;

    console.log('Task statistics calculated:', {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks
    });

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks
    };
  }
}
