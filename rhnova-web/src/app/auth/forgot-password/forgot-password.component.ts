import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms 200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  otpForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  emailSent = signal(false);
  showOtpForm = signal(false);
  userEmail = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    // Email form
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // OTP and password form
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string, formName: 'forgot' | 'otp' = 'forgot'): boolean {
    const form = formName === 'forgot' ? this.forgotPasswordForm : this.otpForm;
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      try {
        const email = this.forgotPasswordForm.value.email;
        const response = await this.authService.forgotPassword(email).toPromise();
        
        if (response) {
          this.emailSent.set(true);
          this.showOtpForm.set(true);
          this.userEmail.set(email);
          this.successMessage.set('Le code de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.');
        }
      } catch (error: any) {
        console.error('Forgot password failed:', error);
        this.errorMessage.set(
          error?.error?.message || 'Échec de l\'envoi de l\'e-mail de réinitialisation. Veuillez réessayer.'
        );
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        this.forgotPasswordForm.get(key)?.markAsTouched();
      });
    }
  }

  async onVerifyOtpAndResetPassword() {
    if (this.otpForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      try {
        const formValue = this.otpForm.value;
        const resetData = {
          email: this.userEmail(),
          otp: formValue.otp,
          newPassword: formValue.newPassword
        };

        const response = await this.authService.verifyOtpAndResetPassword(resetData).toPromise();
        
        if (response) {
          this.successMessage.set('Le mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      } catch (error: any) {
        console.error('OTP verification failed:', error);
        this.errorMessage.set(
          error?.error?.message || 'Code OTP invalide ou échec de la réinitialisation du mot de passe. Veuillez réessayer.'
        );
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.otpForm.controls).forEach(key => {
        this.otpForm.get(key)?.markAsTouched();
      });
    }
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }

  resendEmail() {
    this.emailSent.set(false);
    this.showOtpForm.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.onSubmit();
  }

  goBackToEmail() {
    this.showOtpForm.set(false);
    this.emailSent.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
