import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserResponseDto } from '../../../auth/components/login/Interfaces/LoginResponse';
import { CommonUtil } from '../../utilities/CommonUtil';
import { Router } from '@angular/router';

type MenuItem = 
  | { 
      path: string; 
      title: string; 
      icon: string; 
    } 
  | { 
      heading: string; 
    };

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  constructor(private authService: AuthService,
    private commonUtil: CommonUtil,
    private router: Router
  ) {}
  user: UserResponseDto | null = null;
  isCollapsed = false;
  activeItem: string = 'features/dashboard';

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  Logout() {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.user = this.commonUtil.getCurrentUser();
    console.log(this.user)
    this.setInitialActiveItem();
  }

  private setInitialActiveItem(): void {
    this.activeItem = this.router.url.substring(1); 
  }

  setActiveItem(item: string): void {
    this.activeItem = item;
    this.router.navigate([item]);
  }

  menuItems: MenuItem[] = [
    { heading: 'Core' },
    { path: 'features/dashboard', title: 'Dashboard', icon: 'fas fa-chart-line' },
    { path: 'features/ExpensesList', title: 'Expenses', icon: 'fas fa-wallet' },
    { path: 'users', title: 'Users', icon: 'fas fa-users' },
    { path: 'travel-tours', title: 'Travel & Tours', icon: 'fas fa-route' },
    { path: 'features/incomesList', title: 'Income', icon: 'fas fa-store' },
    
    { heading: 'Management' },
    { path: 'approvals', title: 'Approvals', icon: 'fas fa-check-circle' },
    { path: 'analytics', title: 'Analytics', icon: 'fas fa-chart-bar' },
    { path: 'reports', title: 'Reports', icon: 'fas fa-file-alt' },
    
    { heading: 'Settings' },
    { path: 'preferences', title: 'Preferences', icon: 'fas fa-cog' },
    { path: 'account', title: 'Account', icon: 'fas fa-user-shield' }
  ];
   
  isHeading(item: MenuItem): item is { heading: string } {
    return 'heading' in item;
  }
}
