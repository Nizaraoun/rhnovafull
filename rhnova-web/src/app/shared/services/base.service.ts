import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected baseUrl = '/api';

  constructor(
    protected http: HttpClient,
    protected tokenService: TokenService
  ) {}

  /**
   * Get HTTP headers with authorization
   */
  protected getHeaders(): HttpHeaders {
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
   * Common method for GET requests
   */
  protected get<T>(endpoint: string, params?: any): Observable<T> {
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
  protected post<T>(endpoint: string, body: any): Observable<T> {
    const options = { 
      headers: this.getHeaders() 
    };
    
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Common method for PUT requests
   */
  protected put<T>(endpoint: string, body: any): Observable<T> {
    const options = { 
      headers: this.getHeaders() 
    };
    
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Common method for DELETE requests
   */
  protected delete<T>(endpoint: string): Observable<T> {
    const options = { 
      headers: this.getHeaders() 
    };
    
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Common error handler
   */
  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: Code ${error.status}, Message: ${error.message}`;
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}