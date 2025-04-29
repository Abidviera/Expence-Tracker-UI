import { UserRole } from '../../../app/enums/UserRole.enum';
import { AccountStatus } from '../../../app/enums/AccountStatus.enums';

export interface UserResponse {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    roleName: string;
    role?: UserRole;
    createdAt: Date;
    isVerified: boolean;
    accountStatus: AccountStatus;
  }