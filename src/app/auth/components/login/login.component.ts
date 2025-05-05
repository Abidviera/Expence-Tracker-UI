import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
     private toasterService: ToasterService,
    private router: Router,
    private storageService: StorageService
    
  ) {
    this.loginForm = this.createForm();
    this.checkRememberedEmail();
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  checkRememberedEmail(): void {
    const rememberedEmail = this.storageService.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true,
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      this.storageService.setItem('rememberedEmail', email);
    } else {
      this.storageService.removeItem('rememberedEmail');
    }

    this.authService.login({ email, password }).subscribe({
      next: () => {},
      error: (error) => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
