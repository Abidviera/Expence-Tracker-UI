import { AccountStatus } from '../enums/AccountStatus.enums';
import { UserRole } from '../enums/UserRole.enum';

export class User {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified?: boolean;
  accountStatus?: AccountStatus

}

export interface UserManagementDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  accountStatus: AccountStatus;
  totalExpenses: number;
  totalIncomes: number;
  lastLoginDate?: string;
  canBeApproved: boolean;
  canBeBlocked: boolean;
}

export interface UserPaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
  accountStatus?: AccountStatus;
  role?: UserRole;
  isVerified?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface UserApprovalDto {
  userId: string;
  status: AccountStatus;
  role?: UserRole;
  remarks?: string;
}

export interface BulkUserApprovalDto {
  userIds: string[];
  status: AccountStatus;
  role?: UserRole;
  remarks?: string;
}

export interface UserRoleUpdateDto {
  userId: string;
  role: UserRole;
  remarks?: string;
}

export interface UserApprovalResponseDto {
  success: boolean;
  message: string;
  processedCount: number;
  failedCount: number;
  errors: string[];
}

export interface RoleOption {
  value: UserRole;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface StatusOption {
  value: AccountStatus;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const USER_ROLE_OPTIONS: RoleOption[] = [
  { value: UserRole.Admin, name: 'Admin', description: 'Full system access', color: '#dc3545', icon: 'bi-shield-lock-fill' },
  { value: UserRole.Accountant, name: 'Accountant', description: 'Financial management', color: '#0d6efd', icon: 'bi-calculator-fill' },
  { value: UserRole.Viewer, name: 'Viewer', description: 'Read-only access', color: '#6c757d', icon: 'bi-eye-fill' },
  { value: UserRole.User, name: 'User', description: 'Standard user access', color: '#28a745', icon: 'bi-person-fill' },
  // { value: UserRole.Driver, name: 'Driver', description: 'Driver access', color: '#fd7e14', icon: 'bi-truck' }
];

export const ACCOUNT_STATUS_OPTIONS: StatusOption[] = [
  { value: AccountStatus.UNAPPROVED, name: 'Unapproved', description: 'Awaiting review', color: '#ffc107', icon: 'bi-clock-fill' },
  { value: AccountStatus.PENDING_APPROVAL, name: 'Pending Approval', description: 'Under review', color: '#17a2b8', icon: 'bi-hourglass-split' },
  { value: AccountStatus.ACTIVE, name: 'Active', description: 'Account is active', color: '#28a745', icon: 'bi-check-circle-fill' },
  { value: AccountStatus.BLOCKED, name: 'Blocked', description: 'Account is blocked', color: '#dc3545', icon: 'bi-slash-circle-fill' }
];


