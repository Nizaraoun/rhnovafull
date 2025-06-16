import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  systemForm: FormGroup;
  emailForm: FormGroup;
  securityForm: FormGroup;
  activeTab = 'system';

  constructor(private fb: FormBuilder) {
    this.systemForm = this.fb.group({
      companyName: ['RH Nova'],
      timezone: ['Europe/Paris'],
      dateFormat: ['dd/MM/yyyy'],
      language: ['fr'],
      currency: ['EUR']
    });

    this.emailForm = this.fb.group({
      smtpHost: [''],
      smtpPort: [587],
      smtpUsername: [''],
      smtpPassword: [''],
      fromEmail: [''],
      fromName: ['RH Nova']
    });

    this.securityForm = this.fb.group({
      sessionTimeout: [30],
      passwordMinLength: [8],
      passwordRequireSpecialChars: [true],
      enableTwoFactor: [false],
      allowRememberMe: [true]
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onSystemSubmit(): void {
    if (this.systemForm.valid) {
      console.log('System settings updated:', this.systemForm.value);
      // TODO: Implement actual save logic
    }
  }

  onEmailSubmit(): void {
    if (this.emailForm.valid) {
      console.log('Email settings updated:', this.emailForm.value);
      // TODO: Implement actual save logic
    }
  }

  onSecuritySubmit(): void {
    if (this.securityForm.valid) {
      console.log('Security settings updated:', this.securityForm.value);
      // TODO: Implement actual save logic
    }
  }

  testEmailConnection(): void {
    console.log('Testing email connection...');
    // TODO: Implement email test
  }
}
