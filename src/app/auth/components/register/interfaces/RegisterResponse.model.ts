import { User } from '../../../../models/user.model';

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: any;
}
