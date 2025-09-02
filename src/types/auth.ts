export type UserRole = 'Supervisor' | 'Maintenance Staff' | 'Branding Manager' | 'Depot Ops' | 'Admin';

export interface User {
  userId: string;
  name: string;
  roles: UserRole[];
  defaultRole: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  role?: UserRole;
}

export interface LoginResponse {
  token: string;
  roles: UserRole[];
  mfaRequired: boolean;
}

export interface OTPVerificationRequest {
  otp: string;
}

export interface OTPVerificationResponse {
  token: string;
}

export interface AuthError {
  code: '401' | '429' | '503' | 'INVALID_CREDENTIALS' | 'MFA_REQUIRED' | 'OTP_INVALID' | 'OTP_EXPIRED';
  message: string;
  retryAfter?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  mfaRequired: boolean;
  selectedRole: UserRole | null;
}
