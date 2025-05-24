import { Component, HostListener } from '@angular/core';
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
 isMobileMenuOpen = false;
  user: UserResponseDto | null = null;
  isCollapsed = false;
  activeItem: string = 'features/dashboard';
  menuItems: MenuItem[] = [];
 isMobile = false;
    constructor(private authService: AuthService,
    private commonUtil: CommonUtil,
    private router: Router,
     private menuService: SidebarMenuService
  ) {}

  ngOnInit(): void {
     this.checkScreenSize();
    this.user = this.commonUtil.getCurrentUser();
    console.log(this.user)
     if (this.user) {
      const role = UserRole[this.user.roleName as keyof typeof UserRole];
      this.menuItems = this.menuService.getMenuItemsForRole(role);
    }
    
    this.setInitialActiveItem();
  }

    @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

    private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }
  toggleSidebar(): void {
    if (this.isMobile) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
      
    }
  }

   closeMobileMenu(): void {
    if (this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

    onMenuClick(event: Event): void {
    if (this.isMobile) {
      event.stopPropagation();
    }
  }

  Logout() {
    this.authService.logout();
  }

  
  private setInitialActiveItem(): void {
    this.activeItem = this.router.url.substring(1); 
  }

   setActiveItem(item: string): void {
    this.activeItem = item;
    this.router.navigate([item]);
    
 
    if (this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

    isHeading(item: MenuItem): item is { heading: string } {
    return 'heading' in item;
  }

    getUserInitials(): string {
    if (!this.user) return 'JD';
    
    const firstName = this.user.firstName?.charAt(0) || '';
    const lastName = this.user.lastName?.charAt(0) || '';
    return (firstName + lastName).toUpperCase() || 'JD';
  }
}
