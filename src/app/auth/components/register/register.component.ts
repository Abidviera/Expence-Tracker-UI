import { Component, OnInit } from '@angular/core';
import { UserRole } from '../../../enums/UserRole.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  roles = Object.values(UserRole);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      confirmPassword: ['', Validators.required],
    
      acceptTerms: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
  
    this.isLoading = true;
    const formValue = this.registerForm.value;
    
    this.authService.register({
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role
    }).subscribe({
      next: (response: any) => {
        this.notificationService.showSuccess(
          response.message || 'Registration successful!'
        );
        this.router.navigate(['email-verification'], { 
          state: { email: formValue.email } 
        });
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 
                           error.message || 
                           'Registration failed';
        this.notificationService.showError(errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
