import { Routes } from '@angular/router';

export const MANAGER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/manager-dashboard.component').then(c => c.ManagerDashboardComponent)
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/manager-teams.component').then(c => c.ManagerTeamsComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/manager-tasks.component').then(c => c.ManagerTasksComponent)
  },

  {
    path: 'progress',
    loadComponent: () => import('./progress/progress-tracking.component').then(c => c.ProgressTrackingComponent)
  },
  {
    path: 'leave-requests',
    loadComponent: () => import('./leave-requests/leave-requests.component').then(c => c.LeaveRequestsComponent)
  },
  {
    path: 'team-overview',
    loadComponent: () => import('./team-overview/team-overview.component').then(c => c.TeamOverviewComponent)
  },
  {
    path: 'manager-team',
    loadComponent: () => import('./teams/manager-teams.component').then(c => c.ManagerTeamsComponent)
  }
];
