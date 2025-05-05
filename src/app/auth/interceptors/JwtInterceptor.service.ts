import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { catchError, Observable, throwError } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { Injectable, Injector } from "@angular/core";
import { CommonUtil } from "../../shared/utilities/CommonUtil";
import { ToasterService } from "../../services/toaster.service";
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private authService!: AuthService;
    private commonUtil!: CommonUtil;
    constructor(
      private injector: Injector,
      private router: Router,
      private notificationService: NotificationService,
      private toasterService: ToasterService,
    ) {}
  
    intercept(
      request: HttpRequest<any>,
      next: HttpHandler
    ): Observable<HttpEvent<any>> {
    
      if (!this.authService) {
        this.authService = this.injector.get(AuthService);
      }

      if (!this.commonUtil) {
        this.commonUtil = this.injector.get(CommonUtil);
      }
  
      const token = this.authService.getToken();
      let authRequest = request;
  
      if (token) {
        authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
  
      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          switch (error.status) {
            case 401: 
              this.handleUnauthorizedError();
              break;
            case 403: 
              this.handleForbiddenError();
              break;
            case 500: 
              this.handleServerError();
              break;
            default:
              this.handleGenericError(error);
          }
          return throwError(() => error);
        })
      );
    }
  
    private handleUnauthorizedError(): void {
      this.authService.logout();
      this.notificationService.showError('Session expired. Please login again.');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  
    private handleForbiddenError(): void {
      this.toasterService.error('You do not have permission to access this resource.');
      this.router.navigate(['/']);
    }
  
    private handleServerError(): void {
      this.toasterService.error('Server error occurred. Please try again later.');
    }
  
    private handleGenericError(error: HttpErrorResponse): void {
      const errorMessage = error.error?.message || 'An unexpected error occurred';
      this.toasterService.error(errorMessage);
    }
}
