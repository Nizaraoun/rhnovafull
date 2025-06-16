import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  avatar: string;
  joinDate: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    language: string;
  };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  editMode = false;
  profileForm: FormGroup;

  userProfile: UserProfile = {
    id: '1',
    firstName: 'maryem',
    lastName: 'Doe',
    email: 'maryem.doe@rhnova.com',
    phoneNumber: '+1 (555) 123-4567',
    department: 'HR',
    position: 'HR Manager',
    avatar: '',
    joinDate: new Date('2023-01-15'),
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    preferences: {
      notifications: true,
      emailUpdates: false,
      darkMode: false,
      language: 'en'
    }
  };

  constructor(private fb: FormBuilder) {
    this.profileForm = this.createProfileForm();
  }

  ngOnInit() {
    this.loadProfile();
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      department: ['', [Validators.required]],
      position: ['', [Validators.required]],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
        country: ['']
      }),
      preferences: this.fb.group({
        notifications: [false],
        emailUpdates: [false],
        darkMode: [false],
        language: ['en']
      })
    });
  }

  loadProfile() {
    this.profileForm.patchValue(this.userProfile);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset form to original values
      this.loadProfile();
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      // Update user profile with form values
      this.userProfile = { ...this.userProfile, ...this.profileForm.value };
      this.editMode = false;
      
      // Here you would typically call a service to save the profile
      console.log('Profile saved:', this.userProfile);
      
      // Show success message
      alert('Profile updated successfully!');
    }
  }

  changeAvatar() {
    // Implementation for changing avatar
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.userProfile.avatar = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
}
