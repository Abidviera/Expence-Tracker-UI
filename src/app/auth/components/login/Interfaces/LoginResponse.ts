import { AccountStatus } from "../../../../enums/AccountStatus.enums";

export interface LoginResponse {
    success: boolean;
    token?: string;
    message?: string;
    requiresVerification?: boolean;
    requiresAdminApproval?: boolean;
    accountStatus?: AccountStatus; 
    userDetails?: UserResponseDto; 
  }

  export interface UserResponseDto {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    roleName: string;
    role: number;
    createdAt: string;
    isVerified: boolean;
    accountStatus: number;
  }