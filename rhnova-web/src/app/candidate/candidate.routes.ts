import { Routes } from '@angular/router';

export const CANDIDATE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/candidate-dashboard.component').then(c => c.CandidateDashboardComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/candidate-profile.component').then(c => c.CandidateProfileComponent)
  },
  {
    path: 'cv',
    loadComponent: () => import('./cv/candidate-cv.component').then(c => c.CandidateCvComponent)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./jobs/jobs-list.component').then(c => c.JobsListComponent)
  },
  {
    path: 'applications',
    loadComponent: () => import('./applications/applications.component').then(c => c.ApplicationsComponent)
  },
   {
    path: 'profileview',
    loadComponent: () => import('./profile-view/profile-view.component').then(c => c.ProfileViewComponent)
  },
];
