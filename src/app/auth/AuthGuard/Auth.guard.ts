import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'  
  })
export class AuthGuard implements CanActivate{
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isEmailVerified()) {
        return true;
      } else {
      
        this.router.navigate(['/email-verification'], { 
          queryParams: { returnUrl: state.url, email: this.authService.getUserInfo()?.email }
        });
        return false;
      }
    }
    
    
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}