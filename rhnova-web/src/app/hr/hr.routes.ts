import { Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees.component').then(c => c.EmployeesComponent)
  },
  {
    path: 'payroll',
    loadComponent: () => import('./payroll/payroll.component').then(c => c.PayrollComponent)
  },
  {
    path: 'recruitment',
    loadComponent: () => import('./recruitment/recruitment.component').then(c => c.RecruitmentComponent)
  },
  {
    path: 'performance',
    loadComponent: () => import('./performance/performance.component').then(c => c.PerformanceComponent)
  },
  {
    path: 'leave-management',
    loadComponent: () => import('./leave-management/leave-management.component').then(c => c.LeaveManagementComponent)
  }
];
