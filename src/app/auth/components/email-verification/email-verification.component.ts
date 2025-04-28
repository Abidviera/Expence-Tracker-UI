import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-email-verification',
  standalone: false,
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss',
})
export class EmailVerificationComponent {
  email: string = '';
  otpCode: string = '';
  isLoading = false;
  resendLoading: boolean = false;
  countdown: number = 10;
  countdownDisplay: string = '03:00';
  private countdownInterval: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.email = history.state?.email || '';

    if (!this.email) {
      this.email = this.route.snapshot.queryParams['email'] || '';
    }

    if (!this.email) {
      this.notificationService.showError('No email provided for verification');
      this.router.navigate(['']);
    }

    this.startCountdown();

    if (
      this.authService.isAuthenticated() &&
      this.authService.isEmailVerified()
    ) {
      const returnUrl =
        this.route.snapshot.queryParams['returnUrl'] || '/features/dashboard';
      this.router.navigateByUrl(returnUrl);
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  onOtpInput(event: any): void {
    let otp = '';
    const inputs = event.target.parentElement.querySelectorAll('.otp-input');

    inputs.forEach((input: HTMLInputElement) => {
      otp += input.value;
    });

    this.otpCode = otp;

    if (event.target.value && event.target.nextElementSibling) {
      event.target.nextElementSibling.focus();
    }
  }

  startCountdown() {
    this.clearCountdown();
    this.countdown = 10;
    this.updateCountdownDisplay();

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      this.updateCountdownDisplay();

      if (this.countdown <= 0) {
        this.clearCountdown();
      }
    }, 1000);
  }

  clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  updateCountdownDisplay(): void {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.countdownDisplay = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (!this.otpCode || this.otpCode.length !== 6) {
      this.notificationService.showError('Please enter a valid 6-digit code');
      return;
    }

    this.isLoading = true;

    this.authService.verifyEmail(this.email, this.otpCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.showSuccess(response.message);
        this.router.navigate(['/login'], {
          state: { emailVerified: true }
        });
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Verification failed. Please try again.';
        this.notificationService.showError(errorMessage);
      },
    });
  }

  resendOtp(): void {
    if (!this.email) {
      this.notificationService.showError('Email is required to resend OTP');
      return;
    }

    this.resendLoading = true;

    this.authService.resendOtp(this.email).subscribe({
      next: (response) => {
        this.resendLoading = false;

        if (response?.success) {
          this.notificationService.showSuccess(response.message );
        }
        this.notificationService.showError(
          response?.message || 'Something went wrong.'
        );
        this.startCountdown();
      },
      error: (error) => {
        this.resendLoading = false;
        const msg = error?.error?.message || 'Resend failed. Please try again.';
        this.notificationService.showError(msg);
      },
    });
  }
}
