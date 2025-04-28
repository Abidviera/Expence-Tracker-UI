export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  requiresApproval?: boolean;
  }