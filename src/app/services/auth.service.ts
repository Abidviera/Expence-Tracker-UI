import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegisterRequest } from '../auth/components/register/interfaces/registerRequest.model';
import { RegisterResponse } from '../auth/components/register/interfaces/RegisterResponse.model';
import { VerifyEmailResponse } from '../auth/components/register/interfaces/verifyEmailResponse.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { CommonUtil } from '../shared/utilities/CommonUtil';
import { BehaviorSubject } from 'rxjs';
import { LoginResponse, UserResponseDto } from '../auth/components/login/Interfaces/LoginResponse';
import { AccountStatus } from '../enums/AccountStatus.enums';
import { StorageService } from './storage.service';
import { ToasterService } from './toaster.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly REMEMBER_ME_KEY = 'remember_me';
  private readonly jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router,
     private toasterService: ToasterService,
     private commonUtil: CommonUtil ,
     private storageService: StorageService
  ) {

    
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}register`,
      registerData
    );
  }

  verifyEmail(email: string, verificationCode: string): Observable<VerifyEmailResponse> {
    return this.http.post<VerifyEmailResponse>(`${this.apiUrl}verify-email`, {
      email: email,
      verificationCode: verificationCode
    }).pipe(
      catchError(error => {
       
        let errorMessage = 'Verification failed';
        if (error.error && typeof error.error === 'object') {
          errorMessage = error.error.message || errorMessage;
        }
        return throwError(() => ({ message: errorMessage }));
      })
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}resend-otp`, { email });
  }

  private storeAuthToken(token: string): void {
    this.storageService.setItem(this.AUTH_TOKEN_KEY, token);

    const userInfo = this.getUserInfo();
    if (userInfo) {
      localStorage.setItem('user_info', JSON.stringify(userInfo)); 
      this.commonUtil.setCurrentUser(userInfo);
    }
  }

  getToken(): string | null {
    return this.storageService.getItem(this.AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  logout(): void {
    this.storageService.removeItem(this.AUTH_TOKEN_KEY);
    this.commonUtil.clearCurrentUser();
    this.router.navigate(['/login']);
  }

  getUserInfo(): any {
    const token = this.getToken();
    return token ? this.jwtHelper.decodeToken(token) : null;
  }

  isEmailVerified(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decodedToken = this.jwtHelper.decodeToken(token);

    return true;
  }

  login(loginData: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}login`, loginData).pipe(
      switchMap((loginResponse) => {
        if (loginResponse.success && loginResponse.token) {
          this.storeAuthToken(loginResponse.token);
          
        
          return this.getUserDetails(loginData.email).pipe(
            map((userDetails) => ({
              ...loginResponse,
              userDetails
            }))
          );
        }
        return of(loginResponse);
      }),
      tap((response) => {
        if (response.success && response.token) {
          if (response.requiresVerification) {
            this.toasterService.error('Please verify your email to continue');
            this.router.navigate(['/email-verification'], {
              queryParams: { email: response.userDetails?.email || this.getUserInfo()?.email },
            });
          } 
          else if (response.requiresAdminApproval && response.accountStatus) {
            const statusMessage = this.getStatusMessage(response.accountStatus);
            this.toasterService.error(statusMessage);
          }
          else if (response.userDetails) {
            this.commonUtil.setCurrentUser(response.userDetails);
            this.toasterService.success('Login successful!');
            this.router.navigate(['/features/dashboard'], { replaceUrl: true });
          }
        }
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || error.message || 'Login failed';
        this.toasterService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }

  private getUserDetails(email: string): Observable<UserResponseDto> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<UserResponseDto>(
      `https://localhost:7250/GetUserbyEmail?email=${encodedEmail}`
    );
  }


  private getStatusMessage(status: AccountStatus): string {
    switch(status) {
      case AccountStatus.UNAPPROVED:
        return 'Your account is awaiting admin approval';
      case AccountStatus.PENDING_APPROVAL:
        return 'Your account approval is pending';
      case AccountStatus.BLOCKED:
        return 'Account blocked. Please contact admin';
      default:
        return 'Account status unknown';
    }
  }
}
