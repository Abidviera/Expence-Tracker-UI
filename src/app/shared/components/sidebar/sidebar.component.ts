import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserResponseDto } from '../../../auth/components/login/Interfaces/LoginResponse';
import { CommonUtil } from '../../utilities/CommonUtil';
import { Router } from '@angular/router';
import { MenuItem, SidebarMenuService, UserRole } from '../../../services/sidebar-menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  constructor(private authService: AuthService,
    private commonUtil: CommonUtil,
    private router: Router,
     private menuService: SidebarMenuService
  ) {}
  user: UserResponseDto | null = null;
  isCollapsed = false;
  activeItem: string = 'features/dashboard';
  menuItems: MenuItem[] = [];
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  Logout() {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.user = this.commonUtil.getCurrentUser();
    console.log(this.user)
     if (this.user) {
      // Convert roleName to enum value (you might need to adjust this based on your actual enum)
      const role = UserRole[this.user.roleName as keyof typeof UserRole];
      this.menuItems = this.menuService.getMenuItemsForRole(role);
    }
    
    this.setInitialActiveItem();
  }

  private setInitialActiveItem(): void {
    this.activeItem = this.router.url.substring(1); 
  }

  setActiveItem(item: string): void {
    this.activeItem = item;
    this.router.navigate([item]);
  }

    isHeading(item: MenuItem): item is { heading: string } {
    return 'heading' in item;
  }
}
