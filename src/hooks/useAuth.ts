import { useState, useCallback } from 'react';
import { User, UserRole, LoginCredentials, LoginResponse, OTPVerificationRequest, AuthError } from '@/types/auth';

export function useAuth() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginError, setLoginError] = useState<AuthError | null>(null);
  const [otpError, setOtpError] = useState<AuthError | null>(null);
  const [logoutError, setLogoutError] = useState<AuthError | null>(null);

  // Mock user data for MVP
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simplified demo login - accept any credentials for demo purposes
    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token',
      roles: ['Supervisor'],
      mfaRequired: false,
    };
    
    setSelectedRole('Supervisor');
    setIsAuthenticated(true);
    setUser({
      userId: 'user-123',
      name: 'Demo User',
      roles: ['Supervisor'],
      defaultRole: 'Supervisor',
    });
    
    setIsLoggingIn(false);
    return mockResponse;
  }, []);

  const verifyOTP = useCallback(async (request: OTPVerificationRequest) => {
    setIsVerifyingOTP(true);
    setOtpError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simplified demo OTP - accept any 6-digit code
    setMfaRequired(false);
    setIsAuthenticated(true);
    setUser({
      userId: 'user-123',
      name: 'Demo User',
      roles: ['Supervisor'],
      defaultRole: 'Supervisor',
    });
    
    setIsVerifyingOTP(false);
    return { token: 'mock-jwt-token-verified' };
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setSelectedRole(null);
    setMfaRequired(false);
    setIsAuthenticated(false);
    setUser(null);
    setLoginError(null);
    setOtpError(null);
    setLogoutError(null);
    
    setIsLoggingOut(false);
  }, []);

  const selectRole = useCallback((role: UserRole) => {
    setSelectedRole(role);
    setIsAuthenticated(true);
  }, []);

  const hasMultipleRoles = user?.roles.length && user.roles.length > 1;

  return {
    // State
    user,
    selectedRole,
    mfaRequired,
    isAuthenticated,
    hasMultipleRoles,
    isLoadingUser,
    
    // Mutations
    login,
    verifyOTP,
    logout,
    selectRole,
    
    // Loading states
    isLoggingIn,
    isVerifyingOTP,
    isLoggingOut,
    
    // Error states
    loginError,
    otpError,
    logoutError,
  };
}
