import { CommonModule, formatDate } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { profile, error } from 'console';
import { AuthService } from '../../auth/services/auth.service';
import { ProfileDto } from '../../shared/models';
import { ProfileService } from '../../shared/services/profile.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],

  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent implements OnInit {
  @Input() userId?: string; // Optional input for viewing other users' profiles
  @Input() profile?: ProfileDto; // Optional input for pre-loaded profile data
  @Input() showActions = true; // Whether to show edit/action buttons
  
  currentProfile = signal<ProfileDto | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.profile) {
      // Use provided profile data
      this.currentProfile.set(this.profile);
    } else {
      // Load profile data
      this.loadProfile();
    }
  }

  loadProfile() {
    this.isLoading.set(true);
    this.error.set(null);

    const loadMethod = this.userId 
      ? this.profileService.getProfileByUserId(this.userId)
      : this.profileService.getProfile();

    loadMethod.subscribe({
      next: (profile) => {
        this.currentProfile.set(profile);
        this.isLoading.set(false);
        console.log('Profile loaded:', profile);
      },
      error: (error) => {
        this.error.set('Profile not found or error loading profile');
        this.isLoading.set(false);
        console.error('Error loading profile:', error);
      }
    });
  }

  isOwnProfile(): boolean {
    if (this.userId) {
      const currentUser = this.authService.getUserData();
      return currentUser?.id === this.userId;
    }
    return true; // If no userId specified, assume it's own profile
  }

  onEditProfile() {
    if (this.isOwnProfile()) {
      // Navigate to edit profile page
      window.location.href = `/candidate/profile`;
    } else {
      console.warn('Edit action is only available for own profile');
    }
  
  }


 

  formatDate(dateString?: string): string {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  formatList(items?: string[]): string {
    if (!items || items.length === 0) return 'None specified';
    return items.join(', ');
  }

  formatMultilineList(items?: string[]): string[] {
    if (!items || items.length === 0) return ['None specified'];
    return items;
  }

  getExperienceYears(): string {
    const experiences = this.currentProfile()?.experiences;
    if (!experiences || experiences.length === 0) return 'Not specified';
    
    // Simple calculation - you can make this more sophisticated
    return `${experiences.length} position(s)`;
  }

  getProfileCompleteness(): number {
    const profile = this.currentProfile();
    if (!profile) return 0;

    const fields = [
      profile.dateDeNaissance,
      profile.ville,
      profile.pays,
      profile.profession,
      profile.description,
      profile.formations?.length ? profile.formations : null,
      profile.experiences?.length ? profile.experiences : null,
      profile.competences?.length ? profile.competences : null,
      profile.langues?.length ? profile.langues : null
    ];

    const filledFields = fields.filter(field => field && field !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }

  getProfileImageUrl(): string {
    const profile = this.currentProfile();
    if (!profile) return '';
    
    // Handle both photoUrl (from ProfileDto) and photo (from backend response)
    const photoPath = (profile as any).photoUrl || (profile as any).photo;
    if (!photoPath) return '';
    
    // Use the API endpoint to get the image
    const baseUrl = 'http://localhost:8080';
    const apiUrl = `${baseUrl}/api/profil/image?url=${encodeURIComponent(photoPath)}`;
    
    return apiUrl;
  }

  onImageError(event: any): void {
    console.error('Error loading profile image:', event);
    // Optionally hide the image or show a default avatar
    event.target.style.display = 'none';
  }

  getProfileName(): string {
    const profile = this.currentProfile();
    if (!profile) return 'Profil';
    
    // Handle different name properties that might come from backend
    return (profile as any).candidat?.name || 
           (profile as any).name || 
           profile.userId || 
           'Profil';
  }
}
