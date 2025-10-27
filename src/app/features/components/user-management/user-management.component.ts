import { Component } from '@angular/core';
import { AccountStatus } from '../../../enums/AccountStatus.enums';
import { UserRole } from '../../../enums/UserRole.enum';
import { ACCOUNT_STATUS_OPTIONS, BulkUserApprovalDto, RoleOption, StatusOption, USER_ROLE_OPTIONS, UserApprovalDto, UserManagementDto, UserPaginationRequest, UserRoleUpdateDto } from '../../../models/user.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { UserManagementService } from '../../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
 
  users: UserManagementDto[] = [];
  selectedUsers: Set<string> = new Set();
  totalRecords = 0;
  loading = false;
  filterSection = false;

  overallStats = {
    totalUsers: 0,
    unapprovedCount: 0,
    pendingCount: 0,
    activeCount: 0,
    blockedCount: 0
  };

  AccountStatus = AccountStatus;
  UserRole = UserRole;
  roleOptions = USER_ROLE_OPTIONS;
  statusOptions = ACCOUNT_STATUS_OPTIONS;


  filters: UserPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'createdAt',
    sortDirection: 'desc'
  };

  selectedRole?: UserRole;
  selectedStatus?: AccountStatus;
  selectedVerificationStatus?: boolean;


  showBulkModal = false;
  showRoleModal = false;
  showApprovalModal = false;
  selectedUser?: UserManagementDto;


  bulkAction: {
    status?: AccountStatus;
    role?: UserRole;
    remarks?: string;
  } = {};

  roleUpdateData: {
    role?: UserRole;
    remarks?: string;
  } = {};

  approvalData: {
    status?: AccountStatus;
    role?: UserRole;
    remarks?: string;
  } = {};


  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();


  private statusCounts = new Map<AccountStatus, number>();

  constructor(private userService: UserManagementService) {}

  ngOnInit(): void {
    this.loadUsers();
     this.loadUserStatistics();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filters.searchTerm = searchTerm;
      this.filters.pageNumber = 1;
      this.loadUsers();
    });
  }

  loadUserStatistics(): void {
    this.userService.getUserStatistics().subscribe({
      next: (stats) => {
        this.overallStats = {
          totalUsers: stats.totalUsers,
          unapprovedCount: stats.unapprovedCount,
          pendingCount: stats.pendingCount,
          activeCount: stats.activeCount,
          blockedCount: stats.blockedCount
        };
      },
      error: (error) => {
        console.error('Error fetching statistics:', error);
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getPagedUsers(this.filters).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalRecords = response.totalRecords;
        this.updateStatusCounts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.showError('Failed to load users');
        this.loading = false;
      }
    });
  }

  loadUnapprovedUsers(): void {
    this.filters.accountStatus = AccountStatus.UNAPPROVED;
    this.selectedStatus = AccountStatus.UNAPPROVED;
    this.filters.pageNumber = 1;
    this.loadUsers();
  }

  private updateStatusCounts(): void {
    this.statusCounts.clear();
    this.users.forEach(user => {
      const count = this.statusCounts.get(user.accountStatus) || 0;
      this.statusCounts.set(user.accountStatus, count + 1);
    });
  }

  getStatusCount(status: AccountStatus): number {
    switch(status) {
      case AccountStatus.UNAPPROVED:
        return this.overallStats.unapprovedCount;
      case AccountStatus.PENDING_APPROVAL:
        return this.overallStats.pendingCount;
      case AccountStatus.ACTIVE:
        return this.overallStats.activeCount;
      case AccountStatus.BLOCKED:
        return this.overallStats.blockedCount;
      default:
        return 0;
    }
  }


  toggleUserSelection(userId: string): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.users.forEach(user => this.selectedUsers.add(user.userId));
    } else {
      this.selectedUsers.clear();
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUsers.has(userId);
  }

  isAllSelected(): boolean {
    return this.users.length > 0 && this.selectedUsers.size === this.users.length;
  }


  quickApprove(userId: string): void {
    const user = this.users.find(u => u.userId === userId);
    if (!user) return;

    if (confirm(`Approve ${user.firstName} ${user.lastName} as a User?`)) {
      this.approveUser(user, AccountStatus.ACTIVE, UserRole.User);
    }
  }

  quickBlock(userId: string): void {
    const user = this.users.find(u => u.userId === userId);
    if (!user) return;

    if (confirm(`Are you sure you want to block ${user.firstName} ${user.lastName}?`)) {
      this.approveUser(user, AccountStatus.BLOCKED);
    }
  }

  private approveUser(user: UserManagementDto, status: AccountStatus, role?: UserRole): void {
    const dto: UserApprovalDto = {
      userId: user.userId,
      status: status,
      role: role
    };

    this.userService.approveUser(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('User updated successfully');
          this.loadUsers();
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        console.error('Error approving user:', error);
        this.showError('An error occurred while updating the user');
      }
    });
  }

  updateUserRole(user: UserManagementDto, newRole: UserRole): void {
    const dto: UserRoleUpdateDto = {
      userId: user.userId,
      role: newRole
    };

    this.userService.updateUserRole(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('User role updated successfully');
          this.loadUsers();
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.showError('An error occurred while updating the user role');
      }
    });
  }

  viewUserDetails(user: UserManagementDto): void {
    this.userService.getUserWithActivity(user.userId).subscribe({
      next: (userDetails) => {
        this.selectedUser = userDetails;
      
        console.log('User details:', userDetails);
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        this.showError('Failed to load user details');
      }
    });
  }


  openBulkApprovalModal(): void {
    if (this.selectedUsers.size === 0) {
      this.showError('Please select at least one user');
      return;
    }
    this.bulkAction = {};
    this.showBulkModal = true;
  }

  closeBulkModal(): void {
    this.showBulkModal = false;
    this.bulkAction = {};
  }

  openRoleModal(user: UserManagementDto): void {
    this.selectedUser = user;
    this.roleUpdateData = { role: user.role };
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedUser = undefined;
    this.roleUpdateData = {};
  }

  openApprovalModal(user: UserManagementDto): void {
    this.selectedUser = user;
    this.approvalData = { 
      status: AccountStatus.ACTIVE, 
      role: user.role || UserRole.User 
    };
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedUser = undefined;
    this.approvalData = {};
  }


  bulkApproveUsers(): void {
    if (!this.bulkAction.status) {
      this.showError('Please select a status');
      return;
    }

    const dto: BulkUserApprovalDto = {
      userIds: Array.from(this.selectedUsers),
      status: this.bulkAction.status,
      role: this.bulkAction.role,
      remarks: this.bulkAction.remarks
    };

    this.loading = true;
    this.userService.bulkApproveUsers(dto).subscribe({
      next: (response) => {
        this.loading = false;
        const message = `Processed: ${response.processedCount}, Failed: ${response.failedCount}`;
        
        if (response.success) {
          this.showSuccess(message);
        } else {
          this.showError(message);
        }

        if (response.errors.length > 0) {
          console.error('Bulk approval errors:', response.errors);
        }

        this.selectedUsers.clear();
        this.closeBulkModal();
        this.loadUsers();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error in bulk approval:', error);
        this.showError('An error occurred during bulk approval');
      }
    });
  }

  updateUserRoleFromModal(): void {
    if (!this.selectedUser || !this.roleUpdateData.role) return;

    const dto: UserRoleUpdateDto = {
      userId: this.selectedUser.userId,
      role: this.roleUpdateData.role,
      remarks: this.roleUpdateData.remarks
    };

    this.userService.updateUserRole(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('User role updated successfully');
          this.closeRoleModal();
          this.loadUsers();
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.showError('An error occurred while updating the user role');
      }
    });
  }

  approveUserFromModal(): void {
    if (!this.selectedUser || !this.approvalData.status) return;

    const dto: UserApprovalDto = {
      userId: this.selectedUser.userId,
      status: this.approvalData.status,
      role: this.approvalData.role,
      remarks: this.approvalData.remarks
    };

    this.userService.approveUser(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('User approved successfully');
          this.closeApprovalModal();
          this.loadUsers();
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        console.error('Error approving user:', error);
        this.showError('An error occurred while approving the user');
      }
    });
  }


  toggleFilters(): void {
    this.filterSection = !this.filterSection;
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onRoleFilter(role?: UserRole): void {
    this.filters.role = role;
    this.filters.pageNumber = 1;
    this.loadUsers();
  }

  onStatusFilter(status?: AccountStatus): void {
    this.filters.accountStatus = status;
    this.filters.pageNumber = 1;
    this.loadUsers();
  }

  onVerificationFilter(isVerified?: boolean): void {
    this.filters.isVerified = isVerified;
    this.filters.pageNumber = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: 'createdAt',
      sortDirection: 'desc'
    };
    this.selectedRole = undefined;
    this.selectedStatus = undefined;
    this.selectedVerificationStatus = undefined;
    this.loadUsers();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.searchTerm ||
      this.filters.accountStatus !== undefined ||
      this.filters.role !== undefined ||
      this.filters.isVerified !== undefined ||
      this.filters.fromDate ||
      this.filters.toDate
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filters.searchTerm) count++;
    if (this.filters.accountStatus !== undefined) count++;
    if (this.filters.role !== undefined) count++;
    if (this.filters.isVerified !== undefined) count++;
    if (this.filters.fromDate) count++;
    if (this.filters.toDate) count++;
    return count;
  }


  onSortChange(column: string, direction: string): void {
    this.filters.sortColumn = column;
    this.filters.sortDirection = direction;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.filters.pageNumber < this.getTotalPages()) {
      this.filters.pageNumber++;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    this.filters.pageNumber = page;
    this.loadUsers();
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.filters.pageNumber - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.filters.pageSize);
  }

  getStartItem(): number {
    return this.totalRecords === 0 ? 0 : (this.filters.pageNumber - 1) * this.filters.pageSize + 1;
  }

  getEndItem(): number {
    return Math.min(this.filters.pageNumber * this.filters.pageSize, this.totalRecords);
  }


  getRoleInfo(role?: UserRole): RoleOption | undefined {
    return this.roleOptions.find(r => r.value === role);
  }

  getStatusInfo(status: AccountStatus): StatusOption {
    return this.statusOptions.find(s => s.value === status) || this.statusOptions[0];
  }

  getStatusBadgeClass(status: AccountStatus): string {
    const map: Record<AccountStatus, string> = {
      [AccountStatus.UNAPPROVED]: 'badge-unapproved',
      [AccountStatus.PENDING_APPROVAL]: 'badge-info',
      [AccountStatus.ACTIVE]: 'badge-active',
      [AccountStatus.BLOCKED]: 'badge-blocked'
    };
    return map[status] || 'badge-secondary';
  }

  getRoleBadgeClass(role?: UserRole): string {
    if (role === undefined) return 'badge-secondary';
    
    const map: Record<UserRole, string> = {
      [UserRole.Admin]: 'badge-admin',
      [UserRole.Accountant]: 'badge-Accountant',
      [UserRole.Viewer]: 'badge-viewer',
      [UserRole.User]: 'badge-user',
    };
    return map[role] || 'badge-secondary';
  }

  exportUsers(): void {

    const csvData = this.convertToCSV(this.users);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(users: UserManagementDto[]): string {
    const headers = ['First Name', 'Last Name', 'Email', 'Role', 'Status', 'Verified', 'Expenses', 'Incomes', 'Created Date'];
    const rows = users.map(user => [
      user.firstName,
      user.lastName,
      user.email,
      this.getRoleInfo(user.role)?.name || 'N/A',
      this.getStatusInfo(user.accountStatus).name,
      user.isVerified ? 'Yes' : 'No',
      user.totalExpenses,
      user.totalIncomes,
      new Date(user.createdAt).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

 
  private showSuccess(message: string): void {
    alert(message); 
  }

  private showError(message: string): void {
    alert(message); 
  }
}
