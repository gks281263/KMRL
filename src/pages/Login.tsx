import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { t } from '@/utils/i18n';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
  role: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// OTP validation schema
const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
});

type OTPFormData = z.infer<typeof otpSchema>;

export const Login = () => {
  const { login, verifyOTP, loginError, otpError, isLoggingIn, isVerifyingOTP } = useAuth();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);

  // Login form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // OTP form
  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
    reset: resetOTP,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const watchRememberMe = watch('rememberMe');

  // Handle countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle login submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login({
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe,
        role: data.role as UserRole,
      });

      if (response.mfaRequired) {
        setShowOTPModal(true);
        setOtpCountdown(30); // 30 second countdown
      } else if (response.roles.length > 1) {
        setAvailableRoles(response.roles);
        setShowRoleSelection(true);
      } else {
        // Auto-redirect for single role based on flowchart
        const role = response.roles[0];
        redirectToRoleLanding(role);
      }
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Login failed:', error);
    }
  };

  // Handle OTP submission
  const onSubmitOTP = async (data: OTPFormData) => {
    try {
      await verifyOTP(data.otp);
      setShowOTPModal(false);
      resetOTP();
      // Show role selection after successful OTP verification
      setAvailableRoles(['Supervisor', 'Admin']);
      setShowRoleSelection(true);
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('OTP verification failed:', error);
    }
  };

  // Redirect to role-specific landing page based on flowchart
  const redirectToRoleLanding = (role: UserRole) => {
    switch (role) {
      case 'Supervisor':
        window.location.href = '/data-ingestion';
        break;
      case 'Maintenance Staff':
        window.location.href = '/maintenance-tracker';
        break;
      case 'Branding Manager':
        window.location.href = '/branding-dashboard';
        break;
      case 'Depot Ops':
        window.location.href = '/execution-tracking';
        break;
      case 'Admin':
        window.location.href = '/admin-config';
        break;
      default:
        window.location.href = '/dashboard';
    }
  };

  // Handle role selection
  const handleRoleSelection = (role: UserRole) => {
    setValue('role', role);
    setShowRoleSelection(false);
    redirectToRoleLanding(role);
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    setOtpCountdown(30);
    // In a real app, this would trigger a new OTP request
    console.log('Resending OTP...');
  };

  // Role options for select
  const roleOptions = [
    { value: 'Supervisor', label: t('roles.supervisor') },
    { value: 'Maintenance Staff', label: t('roles.maintenanceStaff') },
    { value: 'Branding Manager', label: t('roles.brandingManager') },
    { value: 'Depot Ops', label: t('roles.depotOps') },
    { value: 'Admin', label: t('roles.admin') },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">KMRL</span>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {t('login.title')}
            </h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 text-left mb-2">
                {t('login.username')}
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={`
                  w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  ${errors.username ? 'border-danger-300' : 'border-neutral-300'}
                `}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-sm text-danger-600 mt-1 text-left" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 text-left mb-2">
                {t('login.password')}
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className={`
                  w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  ${errors.password ? 'border-danger-300' : 'border-neutral-300'}
                `}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-danger-600 mt-1 text-left" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Toggle */}
            <Toggle
              id="rememberMe"
              label={t('login.rememberMe')}
              checked={watchRememberMe || false}
              onChange={(checked) => setValue('rememberMe', checked)}
            />

            {/* Role Selection (hidden for SSO flows) */}
            <Select
              id="role"
              label={t('login.roleSelection')}
              value={watch('role') || ''}
              onChange={(value) => setValue('role', value)}
              options={roleOptions}
            />

            {/* Error Display */}
            {loginError && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <p className="text-sm text-danger-600">
                  {loginError.message}
                  {loginError.retryAfter && (
                    <span className="block mt-1">
                      Retry after {loginError.retryAfter} seconds
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              {t('login.signIn')}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 underline"
              >
                {t('login.forgotPassword')}
              </a>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-200 text-sm text-neutral-600">
            <p>
              {t('login.needHelp')} <a href="mailto:ops@kmrl.gov.in" className="text-primary-600 hover:text-primary-700">{t('login.contactEmail')}</a>
            </p>
          </div>
        </Card>
      </div>

      {/* MFA OTP Modal */}
      <Modal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        title={t('login.mfa.title')}
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={false}
      >
        <form onSubmit={handleSubmitOTP(onSubmitOTP)} className="space-y-6">
          <p className="text-sm text-neutral-600">
            {t('login.mfa.description')}
          </p>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-neutral-700 mb-2">
              OTP Code
            </label>
            <input
              {...registerOTP('otp')}
              type="text"
              id="otp"
              maxLength={6}
              placeholder={t('login.mfa.placeholder')}
              className={`
                w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest
                ${otpErrors.otp ? 'border-danger-300' : 'border-neutral-300'}
              `}
              aria-invalid={!!otpErrors.otp}
              aria-describedby={otpErrors.otp ? 'otp-error' : undefined}
            />
            {otpErrors.otp && (
              <p id="otp-error" className="text-sm text-danger-600 mt-1" role="alert">
                {otpErrors.otp.message}
              </p>
            )}
          </div>

          {otpError && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <p className="text-sm text-danger-600">
                {otpError.message}
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isVerifyingOTP}
              disabled={isVerifyingOTP}
            >
              Verify OTP
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleResendOTP}
              disabled={otpCountdown > 0}
            >
              {otpCountdown > 0 
                ? t('login.mfa.countdown', { seconds: otpCountdown })
                : t('login.mfa.resend')
              }
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Selection Modal */}
      <Modal
        isOpen={showRoleSelection}
        onClose={() => setShowRoleSelection(false)}
        title={t('login.roleSelection')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            You have access to multiple roles. Please select the role you want to use for this session.
          </p>
          
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <Button
                key={role}
                variant="secondary"
                fullWidth
                onClick={() => handleRoleSelection(role)}
                className="justify-start text-left"
              >
                {t(`roles.${role.toLowerCase().replace(' ', '')}` as any)}
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <Toggle
              id="autoDetectRole"
              label={t('login.autoDetectRole')}
              checked={false}
              onChange={() => {}}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
