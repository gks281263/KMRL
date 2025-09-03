import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { OpsMonitorPage } from '@/pages/OpsMonitorPage';
import { useOperationsData } from '@/hooks/useOperationsData';

// Mock the hooks and modules
vi.mock('@/hooks/useOperationsData');
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

const mockUseOperationsData = vi.mocked(useOperationsData);

describe('OpsMonitorPage', () => {
  const mockOperationsData = {
    departures: [
      {
        id: 'dep-1',
        trainId: 'T001',
        routeId: 'R001',
        plannedDeparture: '2024-01-01T08:00:00Z',
        actualDeparture: undefined,
        variance: undefined,
        status: 'scheduled' as const,
        platform: '1',
        destination: 'Central Station',
        isBoarded: false,
        hasFault: false,
        lastUpdated: '2024-01-01T07:55:00Z'
      },
      {
        id: 'dep-2',
        trainId: 'T002',
        routeId: 'R002',
        plannedDeparture: '2024-01-01T08:15:00Z',
        actualDeparture: '2024-01-01T08:20:00Z',
        variance: 300000, // 5 minutes late
        status: 'departed' as const,
        platform: '2',
        destination: 'Airport Station',
        isBoarded: true,
        hasFault: false,
        lastUpdated: '2024-01-01T08:20:00Z'
      }
    ],
    incidents: [
      {
        id: 'inc-1',
        trainId: 'T003',
        serviceId: 'dep-3',
        type: 'mechanical' as const,
        severity: 'high' as const,
        description: 'Brake system malfunction',
        faultCode: 'MECH-001',
        reportedAt: '2024-01-01T08:10:00Z',
        reportedBy: 'operator1',
        status: 'open' as const
      }
    ],
    standbyTrains: [
      {
        id: 'sb-1',
        trainId: 'ST001',
        location: 'Depot A',
        status: 'available' as const,
        capacity: 200,
        lastMaintenance: '2024-01-01T00:00:00Z',
        nextMaintenance: '2024-01-08T00:00:00Z',
        priority: 1
      }
    ],
    standbyDeployments: [],
    snapshot: {
      timestamp: '2024-01-01T08:00:00Z',
      totalServices: 10,
      onTimeServices: 7,
      delayedServices: 2,
      cancelledServices: 1,
      activeIncidents: 1,
      availableStandby: 3,
      deployedStandby: 0,
      systemStatus: 'operational' as const
    },
    autoDeployPolicy: null,
    isLoading: false,
    isConnected: true,
    lastUpdated: '2024-01-01T08:00:00Z',
    refreshData: vi.fn(),
    markBoarded: vi.fn(),
    reportIncident: vi.fn(),
    deployStandby: vi.fn(),
    updateAutoDeployPolicy: vi.fn(),
    error: null,
    clearError: vi.fn()
  };

  beforeEach(() => {
    mockUseOperationsData.mockReturnValue(mockOperationsData);
  });

  it('renders the operations monitor page with correct title', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.monitor.title')).toBeInTheDocument();
    expect(screen.getByText('ops.monitor.subtitle')).toBeInTheDocument();
  });

  it('displays live clock in IST timezone', () => {
    render(<OpsMonitorPage />);
    
    const clockElement = screen.getByText(/IST/);
    expect(clockElement).toBeInTheDocument();
  });

  it('shows connection status indicator', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.monitor.connected')).toBeInTheDocument();
  });

  it('displays system snapshot with correct metrics', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // Total services
    expect(screen.getByText('7')).toBeInTheDocument(); // On time services
    expect(screen.getByText('2')).toBeInTheDocument(); // Delayed services
    expect(screen.getByText('1')).toBeInTheDocument(); // Cancelled services
  });

  it('renders service departures table', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.monitor.departures')).toBeInTheDocument();
    expect(screen.getByText('T001')).toBeInTheDocument();
    expect(screen.getByText('T002')).toBeInTheDocument();
  });

  it('shows departure status with correct icons and colors', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.departures.status.scheduled')).toBeInTheDocument();
    expect(screen.getByText('ops.departures.status.departed')).toBeInTheDocument();
  });

  it('displays variance for delayed departures', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('+5m')).toBeInTheDocument(); // T002 is 5 minutes late
  });

  it('shows mark boarded button for scheduled departures', () => {
    render(<OpsMonitorPage />);
    
    const markBoardedButtons = screen.getAllByText('ops.departures.markBoarded');
    expect(markBoardedButtons).toHaveLength(1); // Only T001 is scheduled
  });

  it('calls markBoarded when mark boarded button is clicked', async () => {
    render(<OpsMonitorPage />);
    
    const markBoardedButton = screen.getByText('ops.departures.markBoarded');
    fireEvent.click(markBoardedButton);
    
    await waitFor(() => {
      expect(mockOperationsData.markBoarded).toHaveBeenCalledWith('dep-1');
    });
  });

  it('shows report fault button for all departures', () => {
    render(<OpsMonitorPage />);
    
    const reportFaultButtons = screen.getAllByText('ops.departures.reportFault');
    expect(reportFaultButtons).toHaveLength(2); // Both departures
  });

  it('opens incident modal when report fault is clicked', () => {
    render(<OpsMonitorPage />);
    
    const reportFaultButton = screen.getAllByText('ops.departures.reportFault')[0];
    fireEvent.click(reportFaultButton);
    
    expect(screen.getByText('ops.incident.title')).toBeInTheDocument();
  });

  it('displays incident log with correct incidents', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.monitor.incidents')).toBeInTheDocument();
    expect(screen.getByText('T003')).toBeInTheDocument();
    expect(screen.getByText('Brake system malfunction')).toBeInTheDocument();
  });

  it('shows incident severity with correct styling', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.incident.severity.high')).toBeInTheDocument();
  });

  it('displays standby deployment panel', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.monitor.standbyDeployment')).toBeInTheDocument();
    expect(screen.getByText('ops.monitor.availableStandby')).toBeInTheDocument();
    expect(screen.getByText('ST001')).toBeInTheDocument();
  });

  it('shows error banner when there is an error', () => {
    const mockDataWithError = {
      ...mockOperationsData,
      error: 'Connection failed'
    };
    mockUseOperationsData.mockReturnValue(mockDataWithError);
    
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
    expect(screen.getByText('common.dismiss')).toBeInTheDocument();
  });

  it('calls clearError when dismiss button is clicked', async () => {
    const mockDataWithError = {
      ...mockOperationsData,
      error: 'Connection failed'
    };
    mockUseOperationsData.mockReturnValue(mockDataWithError);
    
    render(<OpsMonitorPage />);
    
    const dismissButton = screen.getByText('common.dismiss');
    fireEvent.click(dismissButton);
    
    await waitFor(() => {
      expect(mockOperationsData.clearError).toHaveBeenCalled();
    });
  });

  it('calls refreshData when refresh button is clicked', async () => {
    render(<OpsMonitorPage />);
    
    const refreshButton = screen.getByText('ops.monitor.refresh');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockOperationsData.refreshData).toHaveBeenCalled();
    });
  });

  it('shows loading state when data is loading', () => {
    const mockDataLoading = {
      ...mockOperationsData,
      isLoading: true
    };
    mockUseOperationsData.mockReturnValue(mockDataLoading);
    
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    render(<OpsMonitorPage />);
    
    expect(screen.getByText(/ops.monitor.lastUpdated/)).toBeInTheDocument();
  });

  it('shows no incidents message when there are no incidents', () => {
    const mockDataNoIncidents = {
      ...mockOperationsData,
      incidents: []
    };
    mockUseOperationsData.mockReturnValue(mockDataNoIncidents);
    
    render(<OpsMonitorPage />);
    
    expect(screen.getByText('ops.monitor.noIncidents')).toBeInTheDocument();
  });
});
