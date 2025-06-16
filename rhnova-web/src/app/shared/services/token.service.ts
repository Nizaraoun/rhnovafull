import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Get the authentication token from localStorage
   * @returns The authentication token or null if not found
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  /**
   * Save the authentication token to localStorage
   * @param token The token to save
   */
  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Remove the authentication token from localStorage
   */
  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Check if a token exists
   * @returns True if a token exists, false otherwise
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Get the authorization header value
   * @returns The authorization header value including the token
   */
  getAuthorizationHeader(): string | null {
    const token = this.getToken();
    console.log('Token:', token); // Debugging line to check the token value
    return token ? `Bearer ${token}` : null;
  }
}