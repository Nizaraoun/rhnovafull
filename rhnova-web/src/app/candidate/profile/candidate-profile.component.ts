import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { User, ProfileDto, CreateProfileRequest } from '../../shared/models';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss']
})
export class CandidateProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = signal(false);
  currentUser: User | null = null;
  selectedFile: File | null = null;
  currentProfile: ProfileDto | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}
  ngOnInit() {
    this.currentUser = this.authService.getUserData();
    this.initForm();
    this.loadProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      location: [''],
      title: [''],
      experience: [''],
      skills: [''],
      summary: [''],
      // Extended profile fields
      dateDeNaissance: [''],
      ville: [''],
      pays: [''],
      codePostal: [''],
      profession: [''],
      formations: [[]],
      experiences: [[]],
      competences: [[]],
      langues: [[]],
      certifications: [[]],
      projets: [[]],
      description: ['']
    });
  }

  loadProfile() {
    if (!this.currentUser?.id) return;
    
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.currentProfile = profile;
        this.populateForm(profile);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.log('Profile not found or error loading profile:', error);
        this.isLoading.set(false);
        // Profile doesn't exist yet, that's okay
      }
    });
  }
  populateForm(profile: ProfileDto) {
    this.profileForm.patchValue({
      dateDeNaissance: profile.dateDeNaissance,
      ville: profile.ville,
      pays: profile.pays,
      codePostal: profile.codePostal,
      profession: profile.profession,
      formations: Array.isArray(profile.formations) ? profile.formations.join('\n') : '',
      experiences: Array.isArray(profile.experiences) ? profile.experiences.join('\n') : '',
      competences: Array.isArray(profile.competences) ? profile.competences.join(', ') : '',
      langues: Array.isArray(profile.langues) ? profile.langues.join('\n') : '',
      certifications: Array.isArray(profile.certifications) ? profile.certifications.join('\n') : '',
      projets: Array.isArray(profile.projets) ? profile.projets.join('\n') : '',
      description: profile.description
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
        const formValue = this.profileForm.value;
      const profileData: CreateProfileRequest = {
        dateDeNaissance: formValue.dateDeNaissance,
        ville: formValue.ville,
        pays: formValue.pays,
        codePostal: formValue.codePostal,
        profession: formValue.profession,
        formations: this.stringToArray(formValue.formations, '\n'),
        experiences: this.stringToArray(formValue.experiences, '\n'),
        competences: this.stringToArray(formValue.competences, ','),
        langues: this.stringToArray(formValue.langues, '\n'),
        certifications: this.stringToArray(formValue.certifications, '\n'),
        projets: this.stringToArray(formValue.projets, '\n'),
        description: formValue.description,
        phoneNumber: formValue.phone,
      };

      // Use update if profile exists, create if it doesn't
      const apiCall = this.currentProfile 
        ? this.profileService.updateProfile(profileData)
        : this.profileService.createOrUpdateProfile(profileData);

      apiCall.subscribe({
        next: (response) => {
          console.log('Profile saved successfully:', response);
          this.isLoading.set(false);
          // Reload profile to get updated data
          this.loadProfile();
        },
        error: (error) => {
          console.error('Error saving profile:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadProfilePicture();
    }
  }

  uploadProfilePicture() {
    if (!this.selectedFile) return;

    this.isLoading.set(true);
    this.profileService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Profile picture uploaded successfully:', response);
        this.isLoading.set(false);
        // Reload profile to get updated photo URL
        this.loadProfile();
      },
      error: (error) => {
        console.error('Error uploading profile picture:', error);
        this.isLoading.set(false);
      }
    });
  }



  // Generate sample profile data for testing
  generateSampleData() {
    const sampleData = {
      dateDeNaissance: '1990-05-15',
      ville: 'Paris',
      pays: 'France',
      codePostal: '75001',
      profession: 'Développeur Full Stack',
      formations: ['Master en Informatique', 'Licence en Mathématiques'],
      experiences: ['3 ans chez TechCorp', '2 ans chez StartupXYZ'],
      competences: ['Java', 'Spring Boot', 'MongoDB', 'React'],
      langues: ['Français (natif)', 'Anglais (courant)', 'Espagnol (intermédiaire)'],
      certifications: ['AWS Certified Developer', 'Oracle Java SE 11'],
      projets: ['Application e-commerce', 'Système de gestion RH'],
      description: 'Développeur passionné avec 5 ans d\'expérience en développement web.'
    };

    this.profileForm.patchValue(sampleData);
  }

  // Utility methods
  private stringToArray(value: string, delimiter: string): string[] {
    if (!value || typeof value !== 'string') return [];
    return value.split(delimiter)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
}
