import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './Login';
import { mockAuthApi } from '@/services/api/auth';

// Mock the auth API
vi.mock('@/services/api/auth', () => ({
  mockAuthApi: {
    login: vi.fn(),
    verifyOTP: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    reload: vi.fn(),
  },
  writable: true,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Login', () => {
  const mockUseAuth = vi.fn();
  const mockLogin = vi.fn();
  const mockVerifyOTP = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      verifyOTP: mockVerifyOTP,
      loginError: null,
      otpError: null,
      isLoggingIn: false,
      isVerifyingOTP: false,
    });

    vi.mocked(require('@/hooks/useAuth').useAuth).mockImplementation(mockUseAuth);
  });

  it('renders login form with all required fields', () => {
    render(<Login />, { wrapper: createWrapper() });

    expect(screen.getByText('KMRL Train Induction — Secure Access')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<Login />, { wrapper: createWrapper() });

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    render(<Login />, { wrapper: createWrapper() });

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      token: 'mock-token',
      roles: ['Supervisor'],
      mfaRequired: false,
    });

    render(<Login />, { wrapper: createWrapper() });

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        rememberMe: false,
        role: undefined,
      });
    });
  });

  it('shows MFA modal when mfaRequired is true', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      token: 'mock-token',
      roles: ['Supervisor', 'Admin'],
      mfaRequired: true,
    });

    render(<Login />, { wrapper: createWrapper() });

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });
  });

  it('validates OTP input', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      token: 'mock-token',
      roles: ['Supervisor'],
      mfaRequired: true,
    });

    render(<Login />, { wrapper: createWrapper() });

    // Login first
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    // Try to submit OTP with invalid input
    const otpInput = screen.getByLabelText('OTP Code');
    const verifyButton = screen.getByText('Verify OTP');

    await user.type(otpInput, '123');
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('OTP must be 6 digits')).toBeInTheDocument();
    });
  });

  it('submits valid OTP', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      token: 'mock-token',
      roles: ['Supervisor'],
      mfaRequired: true,
    });
    mockVerifyOTP.mockResolvedValue({
      token: 'verified-token',
    });

    render(<Login />, { wrapper: createWrapper() });

    // Login first
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    // Submit valid OTP
    const otpInput = screen.getByLabelText('OTP Code');
    const verifyButton = screen.getByText('Verify OTP');

    await user.type(otpInput, '123456');
    await user.click(verifyButton);

    await waitFor(() => {
      expect(mockVerifyOTP).toHaveBeenCalledWith({ otp: '123456' });
    });
  });

  it('shows role selection when user has multiple roles', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      token: 'mock-token',
      roles: ['Supervisor', 'Admin'],
      mfaRequired: false,
    });

    render(<Login />, { wrapper: createWrapper() });

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Role Selection')).toBeInTheDocument();
      expect(screen.getByText('Supervisor')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('displays login error messages', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      verifyOTP: mockVerifyOTP,
      loginError: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      },
      otpError: null,
      isLoggingIn: false,
      isVerifyingOTP: false,
    });

    render(<Login />, { wrapper: createWrapper() });

    expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
  });

  it('displays OTP error messages', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      token: 'mock-token',
      roles: ['Supervisor'],
      mfaRequired: true,
    });

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      verifyOTP: mockVerifyOTP,
      loginError: null,
      otpError: {
        code: 'OTP_INVALID',
        message: 'Invalid OTP code',
      },
      isLoggingIn: false,
      isVerifyingOTP: false,
    });

    render(<Login />, { wrapper: createWrapper() });

    // Login first to show OTP modal
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP code')).toBeInTheDocument();
    });
  });

  it('handles remember me toggle', async () => {
    const user = userEvent.setup();
    render(<Login />, { wrapper: createWrapper() });

    const rememberMeToggle = screen.getByLabelText('Remember me');
    await user.click(rememberMeToggle);

    expect(rememberMeToggle).toBeChecked();
  });

  it('handles role selection from dropdown', async () => {
    const user = userEvent.setup();
    render(<Login />, { wrapper: createWrapper() });

    const roleSelect = screen.getByLabelText('Role Selection');
    await user.selectOptions(roleSelect, 'Supervisor');

    expect(roleSelect).toHaveValue('Supervisor');
  });

  it('shows loading state during login', async () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      verifyOTP: mockVerifyOTP,
      loginError: null,
      otpError: null,
      isLoggingIn: true,
      isVerifyingOTP: false,
    });

    render(<Login />, { wrapper: createWrapper() });

    const submitButton = screen.getByText('Sign In');
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during OTP verification', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      token: 'mock-token',
      roles: ['Supervisor'],
      mfaRequired: true,
    });

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      verifyOTP: mockVerifyOTP,
      loginError: null,
      otpError: null,
      isLoggingIn: false,
      isVerifyingOTP: true,
    });

    render(<Login />, { wrapper: createWrapper() });

    // Login first to show OTP modal
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      const verifyButton = screen.getByText('Verify OTP');
      expect(verifyButton).toBeDisabled();
    });
  });
});
