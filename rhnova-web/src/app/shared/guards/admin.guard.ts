import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole();
      if (userRole === Role.ADMIN) {
        return true;
      } else {
        // User is not admin, redirect to appropriate dashboard
        this.redirectBasedOnRole();
        return false;
      }
    } else {
      // User is not authenticated, redirect to login
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

  private redirectBasedOnRole(): void {
    const userRole = this.authService.getUserRole();
    switch (userRole) {
      case Role.CANDIDAT:
        this.router.navigate(['/candidate/dashboard']);
        break;
      case Role.RESPONSABLERH:
        this.router.navigate(['/hr/dashboard']);
        break;
      case Role.MANAGER:
        this.router.navigate(['/manager/dashboard']);
        break;
      case Role.MEMBRE_EQUIPE:
        this.router.navigate(['/team-member/dashboard']);
        break;      default:
        this.router.navigate(['/auth/login']);
        break;
    }
  }
}
