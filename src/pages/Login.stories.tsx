import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './Login';

const meta: Meta<typeof Login> = {
  title: 'Pages/Login',
  component: Login,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Secure sign-in page with role selection and MFA OTP functionality for KMRL Train Induction system.',
      },
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  argTypes: {
    // No props for Login component as it's self-contained
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default login form with all fields and validation.',
      },
    },
  },
};

export const WithValidationErrors: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login form showing validation errors for required fields.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByText('Sign In');
    await userEvent.click(submitButton);
  },
};

export const WithLoginError: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login form displaying authentication error message.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the useAuth hook to return an error
      const mockUseAuth = vi.fn().mockReturnValue({
        login: vi.fn(),
        verifyOTP: vi.fn(),
        loginError: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
        otpError: null,
        isLoggingIn: false,
        isVerifyingOTP: false,
      });

      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: mockUseAuth,
      }));

      return <Story />;
    },
  ],
};

export const LoadingState: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login form in loading state during authentication.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the useAuth hook to return loading state
      const mockUseAuth = vi.fn().mockReturnValue({
        login: vi.fn(),
        verifyOTP: vi.fn(),
        loginError: null,
        otpError: null,
        isLoggingIn: true,
        isVerifyingOTP: false,
      });

      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: mockUseAuth,
      }));

      return <Story />;
    },
  ],
};

export const MFARequired: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login flow showing MFA OTP modal after successful password authentication.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the useAuth hook to trigger MFA flow
      const mockLogin = vi.fn().mockResolvedValue({
        token: 'mock-token',
        roles: ['Supervisor'],
        mfaRequired: true,
      });

      const mockUseAuth = vi.fn().mockReturnValue({
        login: mockLogin,
        verifyOTP: vi.fn(),
        loginError: null,
        otpError: null,
        isLoggingIn: false,
        isVerifyingOTP: false,
      });

      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: mockUseAuth,
      }));

      return <Story />;
    },
  ],
};

export const MultipleRoles: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login flow showing role selection modal when user has multiple roles.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the useAuth hook to trigger role selection
      const mockLogin = vi.fn().mockResolvedValue({
        token: 'mock-token',
        roles: ['Supervisor', 'Admin'],
        mfaRequired: false,
      });

      const mockUseAuth = vi.fn().mockReturnValue({
        login: mockLogin,
        verifyOTP: vi.fn(),
        loginError: null,
        otpError: null,
        isLoggingIn: false,
        isVerifyingOTP: false,
      });

      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: mockUseAuth,
      }));

      return <Story />;
    },
  ],
};

export const RateLimited: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login form showing rate limit error with retry countdown.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the useAuth hook to return rate limit error
      const mockUseAuth = vi.fn().mockReturnValue({
        login: vi.fn(),
        verifyOTP: vi.fn(),
        loginError: {
          code: '429',
          message: 'Too many attempts. Please try again later.',
          retryAfter: 30,
        },
        otpError: null,
        isLoggingIn: false,
        isVerifyingOTP: false,
      });

      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: mockUseAuth,
      }));

      return <Story />;
    },
  ],
};

export const ServiceUnavailable: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Login form showing service unavailable error.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the useAuth hook to return service unavailable error
      const mockUseAuth = vi.fn().mockReturnValue({
        login: vi.fn(),
        verifyOTP: vi.fn(),
        loginError: {
          code: '503',
          message: 'Authentication service is temporarily unavailable',
        },
        otpError: null,
        isLoggingIn: false,
        isVerifyingOTP: false,
      });

      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: mockUseAuth,
      }));

      return <Story />;
    },
  ],
};

// Import required dependencies for stories
import { within, userEvent } from '@storybook/testing-library';
import { vi } from 'vitest';
