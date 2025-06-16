import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
    private router: Router,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from local storage (only in browser)
    const authToken = isPlatformBrowser(this.platformId) ? localStorage.getItem('auth_token') : null;

    // Clone the request and add authorization header if token exists
    if (authToken) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return next.handle(authRequest).pipe(        catchError((error: HttpErrorResponse) => {
          // Handle 401 Unauthorized responses (including JWT expired)
          if (error.status === 401) {
            console.warn('Unauthorized request detected. Token may be expired.');
            this.notificationService.showWarning('Your session has expired. Please log in again.');
            
            // Clear stored auth data (only in browser)
            if (isPlatformBrowser(this.platformId)) {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
            }
            
            // Redirect to login
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
    }

    // If no token, proceed with original request
    return next.handle(request);
  }
}
