import { Injectable } from '@angular/core';
import { BulkUserApprovalDto, UserApprovalDto, UserApprovalResponseDto, UserManagementDto, UserPaginationRequest, UserRoleUpdateDto } from '../models/user.model';
import { Observable } from 'rxjs';
import { PaginationResponse } from '../models/IncomePaginationRequest.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
export interface UserStatisticsDto {
  totalUsers: number;
  unapprovedCount: number;
  pendingCount: number;
  activeCount: number;
  blockedCount: number;
  verifiedCount: number;
  roleDistribution: { role: string; count: number }[];
}
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
 private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated users with filters
   */
  getPagedUsers(request: UserPaginationRequest): Observable<PaginationResponse<UserManagementDto>> {
    let params = new HttpParams();

    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginationResponse<UserManagementDto>>(
      `${this.apiUrl}GetPagedUsers`,
      { params }
    );
  }


   getUserStatistics(): Observable<UserStatisticsDto> {
    return this.http.get<UserStatisticsDto>(
      `${this.apiUrl}GetUserStatistics`
    );
  }

  /**
   * Get unapproved users
   */
  getUnapprovedUsers(request: UserPaginationRequest): Observable<PaginationResponse<UserManagementDto>> {
    let params = new HttpParams();

    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginationResponse<UserManagementDto>>(
      `${this.apiUrl}GetUnapprovedUsers`,
      { params }
    );
  }

  /**
   * Get pending approval users
   */
  getPendingApprovalUsers(request: UserPaginationRequest): Observable<PaginationResponse<UserManagementDto>> {
    let params = new HttpParams();

    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginationResponse<UserManagementDto>>(
      `${this.apiUrl}GetPendingApprovalUsers`,
      { params }
    );
  }

  /**
   * Get user with activity details
   */
  getUserWithActivity(userId: string): Observable<UserManagementDto> {
    return this.http.get<UserManagementDto>(
      `${this.apiUrl}GetUserWithActivity/${userId}`
    );
  }

  /**
   * Approve or update single user
   */
  approveUser(dto: UserApprovalDto): Observable<UserApprovalResponseDto> {
  // Convert enum to number explicitly
  const payload = {
    userId: dto.userId,
    status: Number(dto.status),
    role: dto.role !== undefined ? Number(dto.role) : undefined,
    remarks: dto.remarks
  };

  return this.http.put<UserApprovalResponseDto>(
    `${this.apiUrl}ApproveUser`,
    payload
  );
}

  /**
   * Bulk approve users
   */
  bulkApproveUsers(dto: BulkUserApprovalDto): Observable<UserApprovalResponseDto> {
  const payload = {
    userIds: dto.userIds,
    status: Number(dto.status),
    role: dto.role !== undefined ? Number(dto.role) : undefined,
    remarks: dto.remarks
  };

  return this.http.put<UserApprovalResponseDto>(
    `${this.apiUrl}BulkApproveUsers`,
    payload
  );
}

  /**
   * Update user role
   */
  updateUserRole(dto: UserRoleUpdateDto): Observable<UserApprovalResponseDto> {
  const payload = {
    userId: dto.userId,
    role: Number(dto.role),
    remarks: dto.remarks
  };

  return this.http.put<UserApprovalResponseDto>(
    `${this.apiUrl}UpdateUserRole`,
    payload
  );
}

  /**
   * Get available user roles
   */
  getUserRoles(): Observable<{ value: number; name: string }[]> {
    return this.http.get<{ value: number; name: string }[]>(
      `${this.apiUrl}GetUserRoles`
    );
  }

  /**
   * Get available account statuses
   */
  getAccountStatuses(): Observable<{ value: number; name: string }[]> {
    return this.http.get<{ value: number; name: string }[]>(
      `${this.apiUrl}GetAccountStatuses`
    );
  }
}
