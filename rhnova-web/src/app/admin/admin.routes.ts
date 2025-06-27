import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    redirectTo: '/dashboard',
    pathMatch: 'full'
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
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then(c => c.TeamsComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.component').then(c => c.TasksComponent)
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
