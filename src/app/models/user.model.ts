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
