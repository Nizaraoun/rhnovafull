import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly baseUrl = '/api';
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Get HTTP headers with authorization
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const token = this.tokenService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  /**
   * Check if the current user has any of the specified permissions/roles
   * @param requiredRoles Array of roles that are allowed
   * @returns True if user has permission, false otherwise
   */  hasPermission(requiredRoles: string[]): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const userRole = userData.role;
      
      if (!userRole) {
        return false;
      }
      
      return requiredRoles.includes(userRole);
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Get current user's role
   * @returns User's role or null if not found
   */  getCurrentUserRole(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      return userData.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Get current user data
   * @returns User data or null if not found
   */  getCurrentUser(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }

  /**
   * Common method for GET requests
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const options = { 
      headers: this.getHeaders(),
      params: params
    };
    
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Common method for POST requests
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    const options = { 
      headers: this.getHeaders() 
    };
    
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Common method for PUT requests
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const options = { 
      headers: this.getHeaders() 
    };
    
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Common method for DELETE requests
   */
  delete<T>(endpoint: string): Observable<T> {
    const options = { 
      headers: this.getHeaders() 
    };
    
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Common method for PATCH requests
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    const options = { 
      headers: this.getHeaders() 
    };
    
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Upload file endpoint
   */
  uploadFile(endpoint: string, file: File, additionalData?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = new HttpHeaders();
    const token = this.tokenService.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.baseUrl}/${endpoint}`, formData, {
      headers: headers
    }).pipe(catchError(this.handleError));
  }

  /**
   * Download file endpoint
   */
  downloadFile(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Common error handler
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: Code ${error.status}, Message: ${error.message}`;
    }
    
    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
