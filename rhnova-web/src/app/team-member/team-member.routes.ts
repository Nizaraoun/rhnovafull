import { Routes } from '@angular/router';

export const TEAM_MEMBER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/team-member-dashboard.component').then(c => c.TeamMemberDashboardComponent)
  },  {
    path: 'team',
    loadComponent: () => import('./team/team-view.component').then(c => c.TeamViewComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/my-tasks.component').then(c => c.MyTasksComponent)
  },  {
    path: 'request-leave',
    loadComponent: () => import('./request-leave/request-leave-form.component').then(c => c.RequestLeaveFormComponent)
  },
  {
    path: 'my-leave-requests',
    loadComponent: () => import('./my-leave-requests/my-leave-requests.component').then(c => c.MyLeaveRequestsComponent)
  },
  {
    path: 'update-task',
    loadComponent: () => import('./tasks/my-tasks.component').then(c => c.MyTasksComponent)
  }
];
