import { Routes } from '@angular/router';
import { AdminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(c => c.LandingComponent),
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component').then(c => c.ResetPasswordComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(c => c.LayoutComponent),
    children: [      {
        path: 'dashboard',
        loadComponent: () => import('./admin/combined-dashboard/combined-admin-dashboard.component').then(c => c.CombinedAdminDashboardComponent),
        canActivate: [AdminGuard]
      },{
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(r => r.ADMIN_ROUTES),
        canActivate: [AdminGuard]
      },{
        path: 'hr',
        loadChildren: () => import('./hr/hr.routes').then(r => r.HR_ROUTES)
      },      {
        path: 'candidate',
        loadChildren: () => import('./candidate/candidate.routes').then(r => r.CANDIDATE_ROUTES)
      },
      {
        path: 'manager',
        loadChildren: () => import('./manager/manager.routes').then(r => r.MANAGER_ROUTES)
      },
      {
        path: 'team-member',
        loadChildren: () => import('./team-member/team-member.routes').then(r => r.TEAM_MEMBER_ROUTES)
      },      {
        path: 'tasks',
        loadComponent: () => import('./admin/tasks/tasks.component').then(c => c.TasksComponent),
        canActivate: [AdminGuard]
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
