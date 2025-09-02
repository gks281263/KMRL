import { LoginCredentials, LoginResponse, OTPVerificationRequest, OTPVerificationResponse, User, AuthError } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    const authError: AuthError = {
      code: response.status === 401 ? '401' : 
            response.status === 429 ? '429' : 
            response.status === 503 ? '503' : 'INVALID_CREDENTIALS',
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      retryAfter: response.headers.get('Retry-After') ? 
        parseInt(response.headers.get('Retry-After')!) : undefined,
    };
    
    throw authError;
  }
  
  return response.json();
}

// Helper function to make authenticated requests
async function authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  return handleResponse<T>(response);
}

export const authApi = {
  // POST /api/auth/login/
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await handleResponse<LoginResponse>(response);
    
    // Store token in localStorage (in production, this should be httpOnly cookie)
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  },

  // POST /api/auth/verify-otp/
  async verifyOTP(request: OTPVerificationRequest): Promise<OTPVerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse<OTPVerificationResponse>(response);
    
    // Update token if provided
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  },

  // GET /api/auth/me/
  async getCurrentUser(): Promise<User> {
    return authenticatedRequest<User>('/auth/me/');
  },

  // POST /api/auth/logout/
  async logout(): Promise<void> {
    try {
      await authenticatedRequest<void>('/auth/logout/', {
        method: 'POST',
      });
    } finally {
      // Always clear local storage on logout
      localStorage.removeItem('auth_token');
    }
  },

  // POST /api/auth/refresh/
  async refreshToken(): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await handleResponse<{ token: string }>(response);
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  },
};

// Mock API responses for development/testing
export const mockAuthApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.username === 'admin' && credentials.password === 'password123') {
      return {
        token: 'mock-jwt-token',
        roles: ['Supervisor', 'Admin'],
        mfaRequired: true,
      };
    } else if (credentials.username === 'supervisor' && credentials.password === 'password123') {
      return {
        token: 'mock-jwt-token-supervisor',
        roles: ['Supervisor'],
        mfaRequired: false,
      };
    } else {
      const error: AuthError = {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      };
      throw error;
    }
  },

  async verifyOTP(request: OTPVerificationRequest): Promise<OTPVerificationResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (request.otp === '123456') {
      return {
        token: 'mock-jwt-token-verified',
      };
    } else {
      const error: AuthError = {
        code: 'OTP_INVALID',
        message: 'Invalid OTP code',
      };
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      userId: 'user-123',
      name: 'John Doe',
      roles: ['Supervisor', 'Admin'],
      defaultRole: 'Supervisor',
    };
  },

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    localStorage.removeItem('auth_token');
  },

  async refreshToken(): Promise<{ token: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      token: 'mock-refreshed-jwt-token',
    };
  },
};

// Use mock API in development
export const api = import.meta.env.DEV ? mockAuthApi : authApi;
