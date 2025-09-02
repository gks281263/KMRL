import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataIngestionPage } from './DataIngestionPage';

// Mock timers for consistent testing
vi.useFakeTimers();

describe('DataIngestionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the data ingestion dashboard with all components', () => {
    render(<DataIngestionPage />);

    expect(screen.getByText('Data Ingestion Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor and manage data sources for train induction system')).toBeInTheDocument();
    expect(screen.getByText('Force Sync All')).toBeInTheDocument();
    expect(screen.getByText('Ingestion Summary')).toBeInTheDocument();
    expect(screen.getByText('Recent Events')).toBeInTheDocument();
  });

  it('displays all source tiles with correct information', () => {
    render(<DataIngestionPage />);

    // Check all source tiles are rendered
    expect(screen.getByText('Maximo Job Cards')).toBeInTheDocument();
    expect(screen.getByText('Fitness Certificates')).toBeInTheDocument();
    expect(screen.getByText('Branding Contracts')).toBeInTheDocument();
    expect(screen.getByText('IoT and Mileage')).toBeInTheDocument();
    expect(screen.getByText('Cleaning Roster')).toBeInTheDocument();
    expect(screen.getByText('Yard Layout')).toBeInTheDocument();
    expect(screen.getByText('Manual Overrides')).toBeInTheDocument();
  });

  it('displays correct staleness badges', () => {
    render(<DataIngestionPage />);

    // Check for staleness badges
    expect(screen.getByText('Fresh')).toBeInTheDocument();
    expect(screen.getByText('Stale')).toBeInTheDocument();
    expect(screen.getByText('Outdated')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(<DataIngestionPage />);

    // Check for status badges
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('shows ingestion summary with correct metrics', () => {
    render(<DataIngestionPage />);

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Freshness')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // OK sources
    expect(screen.getByText('2')).toBeInTheDocument(); // Warning sources
    expect(screen.getByText('1')).toBeInTheDocument(); // Error sources
  });

  it('displays source metrics correctly', () => {
    render(<DataIngestionPage />);

    // Check Maximo metrics
    expect(screen.getByText('Open:')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // Open count
    expect(screen.getByText('Errors:')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Error count
  });

  it('handles individual source sync', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DataIngestionPage />);

    const syncButtons = screen.getAllByText('Sync');
    const firstSyncButton = syncButtons[0];
    
    await user.click(firstSyncButton);

    // Should show loading state
    expect(screen.getByText('Syncing...')).toBeInTheDocument();

    // Fast-forward time to complete sync
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Syncing...')).not.toBeInTheDocument();
    });
  });

  it('handles force sync all with confirmation modal', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DataIngestionPage />);

    const forceSyncButton = screen.getByText('Force Sync All');
    await user.click(forceSyncButton);

    // Should show confirmation modal
    expect(screen.getByText('Force Sync All Sources')).toBeInTheDocument();
    expect(screen.getByText('This will trigger a full sync of all data sources')).toBeInTheDocument();

    const confirmButton = screen.getByText('Force Sync All');
    await user.click(confirmButton);

    // Modal should close and sync should start
    await waitFor(() => {
      expect(screen.queryByText('Force Sync All Sources')).not.toBeInTheDocument();
    });

    // Fast-forward time to complete sync
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Syncing...')).not.toBeInTheDocument();
    });
  });

  it('shows upload button for appropriate sources', () => {
    render(<DataIngestionPage />);

    // Sources that should have upload buttons
    const uploadButtons = screen.getAllByText('Upload');
    expect(uploadButtons.length).toBeGreaterThan(0);
  });

  it('handles file upload modal', async () => {
    const user = userEvent.setup();
    render(<DataIngestionPage />);

    const uploadButtons = screen.getAllByText('Upload');
    const firstUploadButton = uploadButtons[0];
    
    await user.click(firstUploadButton);

    // Should show upload modal
    expect(screen.getByText(/Upload.*Data/)).toBeInTheDocument();
    expect(screen.getByText('Drop your file here or click to browse')).toBeInTheDocument();
  });

  it('displays recent events timeline', () => {
    render(<DataIngestionPage />);

    expect(screen.getByText('Recent Events')).toBeInTheDocument();
    expect(screen.getByText('IoT sync completed successfully - 234 records processed')).toBeInTheDocument();
    expect(screen.getByText('Maximo sync completed - 12 open tasks found')).toBeInTheDocument();
  });

  it('shows source details modal when clicking on tile', async () => {
    const user = userEvent.setup();
    render(<DataIngestionPage />);

    const maximoTile = screen.getByText('Maximo Job Cards').closest('.bg-white');
    expect(maximoTile).toBeInTheDocument();
    
    if (maximoTile) {
      await user.click(maximoTile);
    }

    // Should show details modal
    expect(screen.getByText('Maximo Job Cards Details')).toBeInTheDocument();
    expect(screen.getByText('Total Records')).toBeInTheDocument();
    expect(screen.getByText('Open Items')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
  });

  it('displays invalid trains for certificate source', () => {
    render(<DataIngestionPage />);

    const certTile = screen.getByText('Fitness Certificates').closest('.bg-white');
    expect(certTile).toBeInTheDocument();
    
    if (certTile) {
      fireEvent.click(certTile);
    }

    // Should show invalid trains in modal
    expect(screen.getByText('Invalid Trains')).toBeInTheDocument();
    expect(screen.getByText('Train 101')).toBeInTheDocument();
    expect(screen.getByText('Train 115')).toBeInTheDocument();
  });

  it('shows error information for failed sources', () => {
    render(<DataIngestionPage />);

    const cleaningTile = screen.getByText('Cleaning Roster').closest('.bg-white');
    expect(cleaningTile).toBeInTheDocument();
    
    if (cleaningTile) {
      fireEvent.click(cleaningTile);
    }

    // Should show error details in modal
    expect(screen.getByText('Cleaning Roster Details')).toBeInTheDocument();
    expect(screen.getByText('Last Error: Connection timeout')).toBeInTheDocument();
  });

  it('handles pre-validation button click', async () => {
    const user = userEvent.setup();
    render(<DataIngestionPage />);

    const preValidationButton = screen.getByText('Run Pre-Validation');
    await user.click(preValidationButton);

    // Should add event to timeline
    await waitFor(() => {
      expect(screen.getByText('Pre-validation started')).toBeInTheDocument();
    });
  });

  it('disables force sync when sources are syncing', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DataIngestionPage />);

    // Start a sync
    const syncButtons = screen.getAllByText('Sync');
    await user.click(syncButtons[0]);

    // Force sync should be disabled
    const forceSyncButton = screen.getByText('Force Sync All');
    expect(forceSyncButton).toBeDisabled();

    // Fast-forward time to complete sync
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(forceSyncButton).not.toBeDisabled();
    });
  });

  it('updates freshness percentage after successful sync', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DataIngestionPage />);

    // Initial freshness
    expect(screen.getByText('85%')).toBeInTheDocument();

    // Force sync all
    const forceSyncButton = screen.getByText('Force Sync All');
    await user.click(forceSyncButton);
    
    const confirmButton = screen.getByText('Force Sync All');
    await user.click(confirmButton);

    // Fast-forward time to complete sync
    vi.advanceTimersByTime(5000);

    // Freshness should be updated to 100%
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('maintains event timeline with latest events', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DataIngestionPage />);

    // Initial events count
    const initialEvents = screen.getAllByText(/ago/);
    const initialCount = initialEvents.length;

    // Trigger a sync
    const syncButtons = screen.getAllByText('Sync');
    await user.click(syncButtons[0]);

    // Fast-forward time to complete sync
    vi.advanceTimersByTime(3000);

    // Should have new event added
    await waitFor(() => {
      const newEvents = screen.getAllByText(/ago/);
      expect(newEvents.length).toBe(initialCount + 1);
    });
  });
});
