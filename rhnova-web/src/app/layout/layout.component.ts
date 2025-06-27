import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../auth/services/auth.service';
import { NotificationService } from '../shared/services/notification.service';
import { Subscription, interval } from 'rxjs';
import { Role } from '../shared/models/role.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = signal(false);
  private tokenCheckSubscription?: Subscription;
  private hasShownExpirationWarning = false;
  
  // Get current user data
  currentUser = computed(() => this.authService.getUserData());
  userRole = computed(() => this.authService.getUserRole());

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Initialize layout
    this.startTokenExpirationCheck();
  }

  ngOnDestroy() {
    if (this.tokenCheckSubscription) {
      this.tokenCheckSubscription.unsubscribe();
    }
  }

  private startTokenExpirationCheck() {
    // Check token expiration every minute
    this.tokenCheckSubscription = interval(60000).subscribe(() => {
      if (this.authService.isAuthenticated()) {
        if (this.authService.isTokenExpiringSoon() && !this.hasShownExpirationWarning) {
          const remainingTime = this.authService.getTokenExpirationTime();
          this.notificationService.showWarning(
            `Your session will expire in ${remainingTime} minute(s). Please save your work.`
          );
          this.hasShownExpirationWarning = true;
        }
      }
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(value => !value);
  }  getPageTitle(): string {
    const role = this.userRole();
    const routes: {[key: string]: string} = {
      [Role.ADMIN]: 'Admin Dashboard',
      [Role.RESPONSABLERH]: 'HR Management',
      [Role.CANDIDAT]: 'Candidate Portal',
      [Role.MANAGER]: 'Manager Dashboard',
      [Role.MEMBRE_EQUIPE]: 'Team Member Dashboard'
    };
    return routes[role || ''] || 'Dashboard';
  }

  // Check if user has specific role
  hasRole(role: Role): boolean {
    return this.userRole() === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }

  // Check if user is HR
  isHR(): boolean {
    return this.hasRole(Role.RESPONSABLERH);
  }
  // Check if user is candidate
  isCandidate(): boolean {
    return this.hasRole(Role.CANDIDAT);
  }

  // Check if user is manager
  isManager(): boolean {
    return this.hasRole(Role.MANAGER);
  }

  // Check if user is team member
  isTeamMember(): boolean {
    return this.hasRole(Role.MEMBRE_EQUIPE);
  }

  // Get role display name
  getRoleDisplayName(role: string | null): string {
    const roleNames: {[key: string]: string} = {
      [Role.ADMIN]: 'Administrator',
      [Role.RESPONSABLERH]: 'HR Manager',
      [Role.CANDIDAT]: 'Candidate',
      [Role.MANAGER]: 'Manager',
      [Role.MEMBRE_EQUIPE]: 'Team Member'
    };
    return roleNames[role || ''] || 'User';
  }

  // Logout method
  logout(): void {
    this.authService.logout();
  }
}
