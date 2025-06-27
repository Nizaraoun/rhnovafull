import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  protected baseUrl = 'http://localhost:8080';

  constructor(protected http: HttpClient) {}

  /**
   * Get headers with authorization token
   */
  protected getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
  /**
   * Generic GET request
   */
  protected get<T>(endpoint: string, params?: any): Observable<T> {
    const options = { 
      headers: this.getHeaders(),
      params: params
    };
    // Ensure no double slashes by normalizing the endpoint path
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    
    console.log(`GET ${fullUrl}`, params ? { params } : '');
    
    return this.http.get<T>(fullUrl, options)
      .pipe(catchError(this.handleError));
  }
  /**
   * Generic POST request
   */
  protected post<T>(endpoint: string, body: any): Observable<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    
    console.log(`POST ${fullUrl}`, body);
    
    return this.http.post<T>(fullUrl, body, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Generic PUT request
   */
  protected put<T>(endpoint: string, body: any): Observable<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    
    console.log(`PUT ${fullUrl}`, body);
    
    return this.http.put<T>(fullUrl, body, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Generic DELETE request
   */
  protected delete<T>(endpoint: string): Observable<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    
    console.log(`DELETE ${fullUrl}`);
    
    return this.http.delete<T>(fullUrl, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Generic PATCH request
   */
  protected patch<T>(endpoint: string, body: any): Observable<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.baseUrl}${normalizedEndpoint}`;
    
    console.log(`PATCH ${fullUrl}`, body);
    
    return this.http.patch<T>(fullUrl, body, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }
  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized: Please login again';
        // Optionally clear token and redirect to login
        localStorage.removeItem('auth_token');
      } else if (error.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to perform this action';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error: Please try again later';
      } else {
        errorMessage = error.error?.message || `Server error: Code ${error.status}, Message: ${error.message}`;
      }
    }
    
    console.error('API Error:', {
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
      url: error.url,
      timestamp: new Date().toISOString()
    });
    
    return throwError(() => new Error(errorMessage));
  }
}
