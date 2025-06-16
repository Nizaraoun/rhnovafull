import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../auth/services/auth.service';
import { NotificationService } from '../shared/services/notification.service';
import { Subscription, interval } from 'rxjs';

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
  }

  getPageTitle(): string {
    // This would typically come from router data or a service
    return 'Dashboard';
  }
}
