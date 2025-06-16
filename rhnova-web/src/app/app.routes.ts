import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent)
  },  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(c => c.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(r => r.ADMIN_ROUTES)
      },
      {
        path: 'hr',
        loadChildren: () => import('./hr/hr.routes').then(r => r.HR_ROUTES)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./admin/tasks/tasks.component').then(c => c.TasksComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
