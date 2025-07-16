import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check token validity on service initialization only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.authStatusSubject.next(this.isAuthenticated());
      this.checkTokenValidity();
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyOtpAndResetPassword(resetData: { email: string, otp: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp-reset-password`, resetData);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    this.authStatusSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  saveAuthData(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify({
        id: response.userId,
        name: response.name,
        email: response.email,
        role: response.role
      }));
    }
    this.authStatusSubject.next(true);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired(token)) {
      this.handleExpiredToken();
      return false;
    }
    
    return true;
  }

  getUserData(): any {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  getUserRole(): string | null {
    const userData = this.getUserData();
    return userData ? userData.role : null;
  }

  private checkTokenValidity(): void {
    const token = this.getToken();
    if (token && this.isTokenExpired(token)) {
      this.handleExpiredToken();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Treat invalid tokens as expired
    }
  }

  private handleExpiredToken(): void {
    console.warn('Token has expired. Logging out user.');
    this.notificationService.showWarning('Your session has expired. Please log in again.');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    this.authStatusSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  refreshAuthStatus(): void {
    this.authStatusSubject.next(this.isAuthenticated());
  }

  // Method to get remaining time before token expires (in minutes)
  getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = payload.exp - currentTime;
      
      return remainingTime > 0 ? Math.floor(remainingTime / 60) : 0; // Return in minutes
    } catch (error) {
      console.error('Error parsing token expiration:', error);
      return null;
    }
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const remainingMinutes = this.getTokenExpirationTime();
    return remainingMinutes !== null && remainingMinutes <= 5 && remainingMinutes > 0;
  }
}
