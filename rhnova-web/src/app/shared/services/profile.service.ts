import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../shared/services/base-http.service';
import { 
  ProfileDto, 
  CreateProfileRequest, 
  UpdateProfileRequest, 
  ProfileResponse,
  UploadPhotoResponse 
} from '../../shared/models/profile.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseHttpService {

  constructor(
    protected override http: HttpClient,
    private authService: AuthService
  ) {
    super(http);
  }

  /**
   * Get current user's ID from auth service
   */
  private getCurrentUserId(): string | null {
    const user = this.authService.getUserData();
    return user?.id || null;
  }

  /**
   * Create or update profile for current user
   */
  createOrUpdateProfile(profileData: CreateProfileRequest): Observable<ProfileResponse> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    console.log('Creating/Updating profile for user:', userId, profileData);
    return this.post<ProfileResponse>(`/api/profil/${userId}`, profileData);
  }

  /**
   * Create or update profile for specific user
   */
  createOrUpdateProfileForUser(userId: string, profileData: CreateProfileRequest): Observable<ProfileResponse> {
    console.log('Creating/Updating profile for user:', userId, profileData);
    return this.post<ProfileResponse>(`/api/profil/${userId}`, profileData);
  }

  /**
   * Get profile for current user
   */
  getProfile(): Observable<ProfileDto> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    console.log('Getting profile for user:', userId);
    return this.get<ProfileDto>(`/api/profil/${userId}`);
  }

  /**
   * Get profile for specific user
   */
  getProfileByUserId(userId: string): Observable<ProfileDto> {
    console.log('Getting profile for user:', userId);
    return this.get<ProfileDto>(`/api/profil/${userId}`);
  }

  /**
   * Update profile for current user
   */
  updateProfile(profileData: UpdateProfileRequest): Observable<ProfileResponse> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    console.log('Updating profile for user:', userId, profileData);
    return this.put<ProfileResponse>(`/api/profil/${userId}`, profileData);
  }

  /**
   * Update profile for specific user
   */
  updateProfileForUser(userId: string, profileData: UpdateProfileRequest): Observable<ProfileResponse> {
    console.log('Updating profile for user:', userId, profileData);
    return this.put<ProfileResponse>(`/api/profil/${userId}`, profileData);
  }

  /**
   * Upload profile picture for current user
   */
  uploadProfilePicture(file: File): Observable<UploadPhotoResponse> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    return this.uploadProfilePictureForUser(userId, file);
  }

  /**
   * Upload profile picture for specific user
   */
  uploadProfilePictureForUser(userId: string, file: File): Observable<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading profile picture for user:', userId, 'File:', file.name);
    
    // For file upload, we need to override headers to not set Content-Type
    // Let browser set it automatically for multipart/form-data
    const token = localStorage.getItem('auth_token');
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const normalizedEndpoint = `/api/profil/${userId}/upload-photo`;
    console.log(`POST file upload to: ${this.baseUrl}${normalizedEndpoint}`);    return this.http.post(`${this.baseUrl}${normalizedEndpoint}`, formData, {
      headers: headers
    }) as Observable<UploadPhotoResponse>;
  }

  /**
   * Delete profile for current user
   */
  deleteProfile(): Observable<ProfileResponse> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    console.log('Deleting profile for user:', userId);
    return this.delete<ProfileResponse>(`/api/profil/${userId}`);
  }

  /**
   * Delete profile for specific user
   */
  deleteProfileForUser(userId: string): Observable<ProfileResponse> {
    console.log('Deleting profile for user:', userId);
    return this.delete<ProfileResponse>(`/api/profil/${userId}`);
  }


}
