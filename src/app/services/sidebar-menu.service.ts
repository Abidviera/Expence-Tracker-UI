import { Injectable } from '@angular/core';

export type MenuItem = 
  | { 
      path: string; 
      title: string; 
      icon: string; 
      roles?: UserRole[]; 
    } 
  | { 
      heading: string;
      roles?: UserRole[]; 
    };

   
export enum UserRole {
  Admin = 'Admin',
  Accountant = 'Accountant',
  Viewer = 'Viewer',
  User = 'User',
  Driver = 'Driver'
}

@Injectable({
  providedIn: 'root'
})
export class SidebarMenuService {

    private allMenuItems: MenuItem[] = [
    { heading: 'Core' },
    { path: 'features/dashboard', title: 'Dashboard', icon: 'fas fa-chart-line' },
    { path: 'features/ExpensesList', title: 'Expenses', icon: 'fas fa-wallet', roles: [UserRole.User, UserRole.Admin, UserRole.Driver] },
    { path: 'users', title: 'Users', icon: 'fas fa-users', roles: [UserRole.Admin] },
    { path: 'travel-tours', title: 'Travel & Tours', icon: 'fas fa-route', roles: [UserRole.Admin, UserRole.User] },
    { path: 'features/incomesList', title: 'Income', icon: 'fas fa-store', roles: [UserRole.Admin, UserRole.User, UserRole.Accountant] },
     { path: 'features/ProfitManagement', title: 'Profit', icon: 'fas fa-file-alt', roles: [UserRole.Admin, UserRole.Accountant] },
     
    { heading: 'Management', roles: [UserRole.Admin, UserRole.Accountant] },
    { path: 'approvals', title: 'Approvals', icon: 'fas fa-check-circle', roles: [UserRole.Admin] },
    { path: 'analytics', title: 'Analytics', icon: 'fas fa-chart-bar', roles: [UserRole.Admin, UserRole.Accountant] },
    { path: 'reports', title: 'Reports', icon: 'fas fa-file-alt', roles: [UserRole.Admin, UserRole.Accountant] },
   
    
    { heading: 'Settings' },
    { path: 'preferences', title: 'Preferences', icon: 'fas fa-cog'},
    { path: 'account', title: 'Account', icon: 'fas fa-user-shield' }
  ];

  getMenuItemsForRole(role: UserRole): MenuItem[] {
    return this.allMenuItems.filter(item => {
     
      if (!('roles' in item) || !item.roles) return true;
      
      return item.roles.includes(role);
    });
  }
}
