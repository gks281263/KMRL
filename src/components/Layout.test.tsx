import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { Layout } from '@/components/Layout';
import { DataIngestionPage } from '@/pages/DataIngestionPage';

// Mock the modules
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
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

describe('Navigation Integration', () => {
  it('renders layout with sidebar and main content', () => {
    renderWithProviders(
      <Layout>
        <DataIngestionPage />
      </Layout>
    );
    
    // Check that the sidebar is rendered
    expect(screen.getByText('Metro System')).toBeInTheDocument();
    
    // Check that the main content is rendered
    expect(screen.getByText('Data Ingestion')).toBeInTheDocument();
  });

  it('shows navigation menu items', () => {
    renderWithProviders(
      <Layout>
        <DataIngestionPage />
      </Layout>
    );
    
    // Check that navigation items are present
    expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
    expect(screen.getByText('nav.dataIngestion')).toBeInTheDocument();
    expect(screen.getByText('nav.validation')).toBeInTheDocument();
    expect(screen.getByText('nav.optimization')).toBeInTheDocument();
    expect(screen.getByText('nav.results')).toBeInTheDocument();
    expect(screen.getByText('nav.review')).toBeInTheDocument();
    expect(screen.getByText('nav.opsMonitor')).toBeInTheDocument();
    expect(screen.getByText('nav.analytics')).toBeInTheDocument();
  });

  it('shows logout button', () => {
    renderWithProviders(
      <Layout>
        <DataIngestionPage />
      </Layout>
    );
    
    expect(screen.getByText('nav.logout')).toBeInTheDocument();
  });

  it('navigates to correct paths when menu items are clicked', () => {
    renderWithProviders(
      <Layout>
        <DataIngestionPage />
      </Layout>
    );
    
    // Click on Analytics menu item
    const analyticsLink = screen.getByText('nav.analytics').closest('a');
    expect(analyticsLink).toHaveAttribute('href', '/analytics');
    
    // Click on Operations Monitor menu item
    const opsMonitorLink = screen.getByText('nav.opsMonitor').closest('a');
    expect(opsMonitorLink).toHaveAttribute('href', '/ops-monitor');
  });
});
