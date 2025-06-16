import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(c => c.UsersComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/roles.component').then(c => c.RolesComponent)
  },
  {
    path: 'job-offers',
    loadComponent: () => import('./job-offers/job-offers.component').then(c => c.JobOffersComponent)
  },
  {
    path: 'candidates',
    loadComponent: () => import('./candidates/candidates.component').then(c => c.CandidatesComponent)
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then(c => c.TeamsComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.component').then(c => c.TasksComponent)
  },
  {
    path: 'interviews',
    loadComponent: () => import('./interviews/interviews.component').then(c => c.InterviewsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(c => c.SettingsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(c => c.ReportsComponent)
  }
];
