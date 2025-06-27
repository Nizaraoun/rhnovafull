import { Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/hr-dashboard.component').then(c => c.HrDashboardComponent)
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees.component').then(c => c.EmployeesComponent)
  },

    {
    path: 'job-offers',
    loadComponent: () => import('./job-offers/job-offers.component').then(c => c.JobOffersComponent)
  },
  {
    path: 'recruitment',
    loadComponent: () => import('./recruitment/recruitment.component').then(c => c.RecruitmentComponent)
  },

  {
    path: 'leave-management',
    loadComponent: () => import('./leave-management/leave-management.component').then(c => c.LeaveManagementComponent)
  },
   {
    path: 'interviews',
    loadComponent: () => import('./interviews/interviews.component').then(c => c.InterviewsComponent)
  },
];
