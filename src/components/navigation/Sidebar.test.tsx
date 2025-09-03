import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { Sidebar } from './Sidebar';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: ({ className }: { className?: string }) => <div data-testid="menu-icon" className={className}>☰</div>,
  X: ({ className }: { className?: string }) => <div data-testid="x-icon" className={className}>✕</div>,
  ChevronLeft: ({ className }: { className?: string }) => <div data-testid="chevron-left-icon" className={className}>‹</div>,
  ChevronRight: ({ className }: { className?: string }) => <div data-testid="chevron-right-icon" className={className}>›</div>,
  LogOut: ({ className }: { className?: string }) => <div data-testid="logout-icon" className={className}>🚪</div>,
  Home: ({ className }: { className?: string }) => <div data-testid="home-icon" className={className}>🏠</div>,
  Database: ({ className }: { className?: string }) => <div data-testid="database-icon" className={className}>🗄️</div>,
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-circle-icon" className={className}>✅</div>,
  Settings: ({ className }: { className?: string }) => <div data-testid="settings-icon" className={className}>⚙️</div>,
  BarChart3: ({ className }: { className?: string }) => <div data-testid="bar-chart-icon" className={className}>📊</div>,
  FileText: ({ className }: { className?: string }) => <div data-testid="file-text-icon" className={className}>📄</div>,
  Play: ({ className }: { className?: string }) => <div data-testid="play-icon" className={className}>▶️</div>,
  TrendingUp: ({ className }: { className?: string }) => <div data-testid="trending-up-icon" className={className}>📈</div>,
  Shield: ({ className }: { className?: string }) => <div data-testid="shield-icon" className={className}>🛡️</div>,
}));

// Mock the utility function
vi.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock the Button component
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    // Mock the fetchUserProfile function
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          userId: 'user-123',
          name: 'John Doe',
          roles: ['Supervisor']
        })
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<Sidebar />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders user information after loading', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('Metro System')).toBeInTheDocument();
      expect(screen.getByText('John Doe • Supervisor')).toBeInTheDocument();
    });
  });

  it('renders navigation items based on user roles', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      // Supervisor should see these items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Data Ingestion')).toBeInTheDocument();
      expect(screen.getByText('Validation')).toBeInTheDocument();
      expect(screen.getByText('Optimization Setup')).toBeInTheDocument();
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('Review & What-if')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      
      // Supervisor should NOT see these items
      expect(screen.queryByText('Execution Tracking')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin & Config')).not.toBeInTheDocument();
    });
  });

  it('shows admin warning for admin-only items when user has admin role', async () => {
    // Mock admin user
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          userId: 'admin-123',
          name: 'Admin User',
          roles: ['Admin']
        })
      } as Response)
    );

    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin & Config')).toBeInTheDocument();
      // Admin warning icon should be visible
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  it('toggles collapse state when collapse button is clicked', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('Metro System')).toBeInTheDocument();
    });

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseButton);

    // Should show expand button after collapse
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
  });

  it('shows mobile menu button on mobile devices', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });
  });

  it('opens mobile menu when mobile menu button is clicked', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      const mobileMenuButton = screen.getByLabelText('Open navigation menu');
      fireEvent.click(mobileMenuButton);
    });

    // Mobile menu should be visible
    expect(screen.getByLabelText('Close navigation menu')).toBeInTheDocument();
    expect(screen.getByText('Metro System')).toBeInTheDocument();
  });

  it('closes mobile menu when close button is clicked', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      const mobileMenuButton = screen.getByLabelText('Open navigation menu');
      fireEvent.click(mobileMenuButton);
    });

    const closeButton = screen.getByLabelText('Close navigation menu');
    fireEvent.click(closeButton);

    // Mobile menu should be hidden
    expect(screen.queryByLabelText('Close navigation menu')).not.toBeInTheDocument();
  });

  it('closes mobile menu when overlay is clicked', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      const mobileMenuButton = screen.getByLabelText('Open navigation menu');
      fireEvent.click(mobileMenuButton);
    });

    const overlay = screen.getByLabelText('Close navigation menu');
    fireEvent.click(overlay);

    // Mobile menu should be hidden
    expect(screen.queryByLabelText('Close navigation menu')).not.toBeInTheDocument();
  });

  it('renders logout button', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('renders logout button with correct styling', async () => {
    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toHaveClass('text-neutral-700');
    });
  });

  it('applies custom className when provided', async () => {
    renderWithProviders(<Sidebar className="custom-sidebar" />);
    
    await waitFor(() => {
      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('custom-sidebar');
    });
  });

  it('filters menu items correctly for different roles', async () => {
    // Test with Branding Manager role
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          userId: 'branding-123',
          name: 'Branding User',
          roles: ['Branding Manager']
        })
      } as Response)
    );

    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      // Branding Manager should see these items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Optimization Setup')).toBeInTheDocument();
      
      // Branding Manager should NOT see these items
      expect(screen.queryByText('Data Ingestion')).not.toBeInTheDocument();
      expect(screen.queryByText('Results')).not.toBeInTheDocument();
      expect(screen.queryByText('Review & What-if')).not.toBeInTheDocument();
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    });
  });

  it('handles multiple roles correctly', async () => {
    // Test with user having multiple roles
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          userId: 'multi-123',
          name: 'Multi User',
          roles: ['Supervisor', 'Branding Manager']
        })
      } as Response)
    );

    renderWithProviders(<Sidebar />);
    
    await waitFor(() => {
      // Should see items from both roles
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Data Ingestion')).toBeInTheDocument();
      expect(screen.getByText('Optimization Setup')).toBeInTheDocument();
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('Review & What-if')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });
});
