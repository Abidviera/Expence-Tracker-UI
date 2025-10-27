import { Component } from '@angular/core';
import { AccountStatus } from '../../../enums/AccountStatus.enums';
import { UserRole } from '../../../enums/UserRole.enum';
import { ACCOUNT_STATUS_OPTIONS, BulkUserApprovalDto, RoleOption, StatusOption, USER_ROLE_OPTIONS, UserApprovalDto, UserManagementDto, UserPaginationRequest, UserRoleUpdateDto } from '../../../models/user.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { UserManagementService } from '../../../services/user-management.service';

@Component({
  selector: 'app-approvals',
  standalone: false,
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent {
 pendingUsers: UserManagementDto[] = [];
  selectedUsers: Set<string> = new Set();
  totalRecords = 0;
  loading = false;

  // Enums
  AccountStatus = AccountStatus;
  UserRole = UserRole;
  roleOptions = USER_ROLE_OPTIONS;

  // Filters
  filters: UserPaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: 'createdAt',
    sortDirection: 'desc',
    accountStatus: AccountStatus.UNAPPROVED
  };

  // Quick stats
  stats = {
    unapproved: 0,
    pendingApproval: 0,
    totalPending: 0
  };

  // Modals
  showApprovalModal = false;
  showBulkModal = false;
  showRejectModal = false;
  selectedUser?: UserManagementDto;

  // Modal data
  approvalData: {
    role?: UserRole;
    remarks?: string;
  } = {};

  bulkApprovalData: {
    role?: UserRole;
    remarks?: string;
  } = {};

  rejectData: {
    reason?: string;
  } = {};

  // Active tab
  activeTab: 'unapproved' | 'pending' = 'unapproved';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private userService: UserManagementService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
    this.loadStatistics();
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
      this.loadPendingUsers();
    });
  }

  // Data Loading
  loadPendingUsers(): void {
    this.loading = true;
    this.userService.getPagedUsers(this.filters).subscribe({
      next: (response) => {
        this.pendingUsers = response.data;
        this.totalRecords = response.totalRecords;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending users:', error);
        this.showError('Failed to load pending users');
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    const unapprovedRequest: UserPaginationRequest = {
      pageNumber: 1,
      pageSize: 1,
      accountStatus: AccountStatus.UNAPPROVED
    };

    const pendingRequest: UserPaginationRequest = {
      pageNumber: 1,
      pageSize: 1,
      accountStatus: AccountStatus.PENDING_APPROVAL
    };

    this.userService.getPagedUsers(unapprovedRequest).subscribe({
      next: (response) => {
        this.stats.unapproved = response.totalRecords;
        this.stats.totalPending = this.stats.unapproved + this.stats.pendingApproval;
      }
    });

    this.userService.getPagedUsers(pendingRequest).subscribe({
      next: (response) => {
        this.stats.pendingApproval = response.totalRecords;
        this.stats.totalPending = this.stats.unapproved + this.stats.pendingApproval;
      }
    });
  }

  // Tab Switching
  switchTab(tab: 'unapproved' | 'pending'): void {
    this.activeTab = tab;
    this.filters.accountStatus = tab === 'unapproved' 
      ? AccountStatus.UNAPPROVED 
      : AccountStatus.PENDING_APPROVAL;
    this.filters.pageNumber = 1;
    this.selectedUsers.clear();
    this.loadPendingUsers();
  }

  // Selection Management
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
      this.pendingUsers.forEach(user => this.selectedUsers.add(user.userId));
    } else {
      this.selectedUsers.clear();
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUsers.has(userId);
  }

  isAllSelected(): boolean {
    return this.pendingUsers.length > 0 && 
           this.selectedUsers.size === this.pendingUsers.length;
  }

  // Quick Actions
  quickApproveAsUser(userId: string): void {
    const user = this.pendingUsers.find(u => u.userId === userId);
    if (!user) return;

    if (confirm(`Quick approve ${user.firstName} ${user.lastName} as User?`)) {
      const dto: UserApprovalDto = {
        userId: userId,
        status: AccountStatus.ACTIVE,
        role: UserRole.User
      };

      this.approveUser(dto);
    }
  }

  quickReject(userId: string): void {
    const user = this.pendingUsers.find(u => u.userId === userId);
    if (!user) return;

    this.selectedUser = user;
    this.rejectData = {};
    this.showRejectModal = true;
  }

  // Modal Actions
  openApprovalModal(user: UserManagementDto): void {
    this.selectedUser = user;
    this.approvalData = {
      role: UserRole.User
    };
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedUser = undefined;
    this.approvalData = {};
  }

  openBulkApprovalModal(): void {
    if (this.selectedUsers.size === 0) {
      this.showError('Please select at least one user');
      return;
    }
    this.bulkApprovalData = { role: UserRole.User };
    this.showBulkModal = true;
  }

  closeBulkModal(): void {
    this.showBulkModal = false;
    this.bulkApprovalData = {};
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedUser = undefined;
    this.rejectData = {};
  }

  // Approval Operations
  approveUserFromModal(): void {
    if (!this.selectedUser || !this.approvalData.role) {
      this.showError('Please select a role');
      return;
    }

    const dto: UserApprovalDto = {
      userId: this.selectedUser.userId,
      status: AccountStatus.ACTIVE,
      role: this.approvalData.role,
      remarks: this.approvalData.remarks
    };

    this.approveUser(dto);
  }

  private approveUser(dto: UserApprovalDto): void {
    this.loading = true;
    this.userService.approveUser(dto).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.showSuccess('User approved successfully');
          this.closeApprovalModal();
          this.loadPendingUsers();
          this.loadStatistics();
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error approving user:', error);
        this.showError('Failed to approve user');
      }
    });
  }

  bulkApproveUsers(): void {
    if (!this.bulkApprovalData.role) {
      this.showError('Please select a role');
      return;
    }

    const dto: BulkUserApprovalDto = {
      userIds: Array.from(this.selectedUsers),
      status: AccountStatus.ACTIVE,
      role: this.bulkApprovalData.role,
      remarks: this.bulkApprovalData.remarks
    };

    this.loading = true;
    this.userService.bulkApproveUsers(dto).subscribe({
      next: (response) => {
        this.loading = false;
        const message = `Approved: ${response.processedCount}, Failed: ${response.failedCount}`;
        
        if (response.success) {
          this.showSuccess(message);
        } else {
          this.showError(message);
        }

        this.selectedUsers.clear();
        this.closeBulkModal();
        this.loadPendingUsers();
        this.loadStatistics();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error in bulk approval:', error);
        this.showError('Failed to perform bulk approval');
      }
    });
  }

  rejectUser(): void {
    if (!this.selectedUser) return;

    const dto: UserApprovalDto = {
      userId: this.selectedUser.userId,
      status: AccountStatus.BLOCKED,
      remarks: this.rejectData.reason || 'User registration rejected'
    };

    this.loading = true;
    this.userService.approveUser(dto).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.showSuccess('User rejected successfully');
          this.closeRejectModal();
          this.loadPendingUsers();
          this.loadStatistics();
        } else {
          this.showError(response.message);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error rejecting user:', error);
        this.showError('Failed to reject user');
      }
    });
  }

  // Search & Filter
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  refreshList(): void {
    this.filters.searchTerm = '';
    this.filters.pageNumber = 1;
    this.selectedUsers.clear();
    this.loadPendingUsers();
    this.loadStatistics();
  }

  // Pagination
  previousPage(): void {
    if (this.filters.pageNumber > 1) {
      this.filters.pageNumber--;
      this.loadPendingUsers();
    }
  }

  nextPage(): void {
    if (this.filters.pageNumber < this.getTotalPages()) {
      this.filters.pageNumber++;
      this.loadPendingUsers();
    }
  }

  goToPage(page: number): void {
    this.filters.pageNumber = page;
    this.loadPendingUsers();
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

  // Helpers
  getRoleInfo(role?: UserRole): RoleOption | undefined {
    return this.roleOptions.find(r => r.value === role);
  }

  getRoleBadgeClass(role?: UserRole): string {
    if (role === undefined) return 'badge-secondary';
    
    const map: Record<UserRole, string> = {
      [UserRole.Admin]: 'badge-admin',
      [UserRole.Accountant]: 'badge-accountant',
      [UserRole.Viewer]: 'badge-viewer',
      [UserRole.User]: 'badge-user',
    };
    return map[role] || 'badge-secondary';
  }

    getDaysWaiting(createdAt: string | Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }


  private showSuccess(message: string): void {
    alert(message);
  }

  private showError(message: string): void {
    alert(message);
  }
}
