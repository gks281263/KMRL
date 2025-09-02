// Simple translation function for i18n-ready strings
// In a real application, this would integrate with a proper i18n library like react-i18next

type TranslationKey = 
  | 'login.title'
  | 'login.username'
  | 'login.password'
  | 'login.rememberMe'
  | 'login.signIn'
  | 'login.forgotPassword'
  | 'login.needHelp'
  | 'login.contactEmail'
  | 'login.roleSelection'
  | 'login.autoDetectRole'
  | 'login.mfa.title'
  | 'login.mfa.description'
  | 'login.mfa.placeholder'
  | 'login.mfa.resend'
  | 'login.mfa.countdown'
  | 'login.errors.invalidCredentials'
  | 'login.errors.rateLimit'
  | 'login.errors.serviceUnavailable'
  | 'login.errors.otpInvalid'
  | 'login.errors.otpExpired'
  | 'roles.supervisor'
  | 'roles.maintenanceStaff'
  | 'roles.brandingManager'
  | 'roles.depotOps'
  | 'roles.admin';

const translations: Record<TranslationKey, string> = {
  'login.title': 'KMRL Train Induction — Secure Access',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.rememberMe': 'Remember me',
  'login.signIn': 'Sign In',
  'login.forgotPassword': 'Forgot password?',
  'login.needHelp': 'Need help? Contact:',
  'login.contactEmail': 'ops@kmrl.gov.in',
  'login.roleSelection': 'Role Selection',
  'login.autoDetectRole': 'Auto-detect role',
  'login.mfa.title': 'Two-Factor Authentication',
  'login.mfa.description': 'Enter the 6-digit code sent to your device',
  'login.mfa.placeholder': 'Enter 6-digit code',
  'login.mfa.resend': 'Resend OTP',
  'login.mfa.countdown': 'Resend available in {seconds}s',
  'login.errors.invalidCredentials': 'Invalid username or password',
  'login.errors.rateLimit': 'Too many attempts. Please try again in {seconds} seconds',
  'login.errors.serviceUnavailable': 'Authentication service is temporarily unavailable',
  'login.errors.otpInvalid': 'Invalid OTP code',
  'login.errors.otpExpired': 'OTP code has expired',
  'roles.supervisor': 'Supervisor',
  'roles.maintenanceStaff': 'Maintenance Staff',
  'roles.brandingManager': 'Branding Manager',
  'roles.depotOps': 'Depot Ops',
  'roles.admin': 'Admin',
};

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let translation = translations[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, String(value));
    });
  }
  
  return translation;
}
