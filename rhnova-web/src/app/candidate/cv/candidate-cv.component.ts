import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-candidate-cv',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-cv.component.html',
  styleUrls: ['./candidate-cv.component.scss']
})
export class CandidateCvComponent implements OnInit {
  cvForm!: FormGroup;
  isLoading = signal(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.cvForm = this.fb.group({
      experiences: this.fb.array([this.createExperienceGroup()]),
      education: this.fb.array([this.createEducationGroup()]),
      technicalSkills: [''],
      softSkills: [''],
      languages: ['']
    });
  }

  get experiences() {
    return this.cvForm.get('experiences') as FormArray;
  }

  get education() {
    return this.cvForm.get('education') as FormArray;
  }

  createExperienceGroup(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      description: ['']
    });
  }

  createEducationGroup(): FormGroup {
    return this.fb.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      year: ['', Validators.required],
      grade: ['']
    });
  }

  addExperience() {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  addEducation() {
    this.education.push(this.createEducationGroup());
  }

  removeEducation(index: number) {
    this.education.removeAt(index);
  }

  previewCV() {
    console.log('CV Preview:', this.cvForm.value);
    // Here you would implement CV preview functionality
  }

  onSubmit() {
    if (this.cvForm.valid) {
      this.isLoading.set(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log('CV data:', this.cvForm.value);
        this.isLoading.set(false);
        // Here you would typically call a service to save the CV
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.cvForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }
}
