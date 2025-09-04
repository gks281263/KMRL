import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

// Mock the hooks and modules
vi.mock('@/hooks/useAnalyticsData');
vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

const mockUseAnalyticsData = vi.mocked(useAnalyticsData);

describe('AnalyticsPage', () => {
  const mockAnalyticsData = {
    summary: {
      kpis: [
        {
          id: 'punctuality',
          name: 'Punctuality',
          value: 94.2,
          unit: '%',
          delta: 2.1,
          trend: 'up' as const,
          sparkline: [92.1, 93.5, 94.2, 93.8, 94.5, 94.2, 94.8],
          lastUpdated: '2024-01-01T08:00:00Z'
        },
        {
          id: 'mileageVariance',
          name: 'Mileage Variance',
          value: 5.3,
          unit: 'km',
          delta: -1.2,
          trend: 'down' as const,
          sparkline: [6.5, 6.2, 5.8, 5.5, 5.3, 5.1, 5.3],
          lastUpdated: '2024-01-01T08:00:00Z'
        }
      ],
      charts: [],
      mlDatasets: [],
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31',
        compareToPrevious: false
      },
      lastUpdated: '2024-01-01T08:00:00Z'
    },
    mlDatasets: [
      {
        id: 'dataset-1',
        name: 'Train Operations',
        status: 'ready' as const,
        lastUpdated: '2024-01-01T08:00:00Z',
        recordCount: 10000,
        fieldCount: 25,
        completeness: 98.5
      },
      {
        id: 'dataset-2',
        name: 'Maintenance Records',
        status: 'missing_fields' as const,
        lastUpdated: '2024-01-01T08:00:00Z',
        missingFields: ['repair_time', 'technician_id'],
        recordCount: 5000,
        fieldCount: 20,
        completeness: 85.2
      }
    ],
    mileageData: [
      {
        date: '2024-01-01',
        plannedMileage: 1000,
        actualMileage: 980,
        variance: -20,
        efficiency: 98.0,
        trainsInService: 20,
        averageDelay: 2
      }
    ],
    brandingData: [
      {
        date: '2024-01-01',
        totalTrains: 50,
        brandedTrains: 45,
        complianceRate: 90.0,
        pendingRenewals: 2,
        completedRenewals: 1,
        overdueRenewals: 0
      }
    ],
    shuntingData: [
      {
        date: '2024-01-01',
        timeSlot: '08:00',
        shuntingOperations: 15,
        energyConsumption: 150,
        averageDuration: 20,
        efficiency: 85,
        trainsMoved: 5
      }
    ],
    isLoading: false,
    isChartLoading: false,
    isExporting: false,
    lastUpdated: '2024-01-01T08:00:00Z',
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31',
      compareToPrevious: false
    },
    refreshData: vi.fn(),
    updateDateRange: vi.fn(),
    exportMlDataset: vi.fn(),
    triggerMlRetrain: vi.fn(),
    error: null,
    clearError: vi.fn()
  };

  beforeEach(() => {
    mockUseAnalyticsData.mockReturnValue(mockAnalyticsData);
  });

  it('renders the analytics page with correct title', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('analytics.title')).toBeInTheDocument();
    expect(screen.getByText('analytics.subtitle')).toBeInTheDocument();
  });

  it('displays KPI cards with correct data', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('Punctuality')).toBeInTheDocument();
    expect(screen.getByText('94.2%')).toBeInTheDocument();
    expect(screen.getByText('Mileage Variance')).toBeInTheDocument();
    expect(screen.getByText('5.3 km')).toBeInTheDocument();
  });

  it('shows date range selector', () => {
    render(<AnalyticsPage />);
    
    const dateInputs = screen.getAllByDisplayValue('2024-01-01');
    expect(dateInputs).toHaveLength(2); // Start and end date inputs
  });

  it('shows compare to previous period toggle', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('analytics.dateRange.compareToPrevious')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls updateDateRange when date range changes', async () => {
    render(<AnalyticsPage />);
    
    const endDateInput = screen.getAllByDisplayValue('2024-01-01')[1];
    fireEvent.change(endDateInput, { target: { value: '2024-02-01' } });
    
    await waitFor(() => {
      expect(mockAnalyticsData.updateDateRange).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-02-01',
        false
      );
    });
  });

  it('calls updateDateRange when compare toggle changes', async () => {
    render(<AnalyticsPage />);
    
    const compareCheckbox = screen.getByRole('checkbox');
    fireEvent.click(compareCheckbox);
    
    await waitFor(() => {
      expect(mockAnalyticsData.updateDateRange).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31',
        true
      );
    });
  });

  it('calls refreshData when refresh button is clicked', async () => {
    render(<AnalyticsPage />);
    
    const refreshButton = screen.getByText('analytics.actions.refresh');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockAnalyticsData.refreshData).toHaveBeenCalled();
    });
  });

  it('displays ML datasets table', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('analytics.ml.datasets')).toBeInTheDocument();
    expect(screen.getByText('Train Operations')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Records')).toBeInTheDocument();
  });

  it('shows dataset status with correct styling', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('analytics.ml.status.ready')).toBeInTheDocument();
    expect(screen.getByText('analytics.ml.status.missingFields')).toBeInTheDocument();
  });

  it('allows selecting datasets for export', () => {
    render(<AnalyticsPage />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const datasetCheckbox = checkboxes[1]; // First dataset checkbox
    
    fireEvent.click(datasetCheckbox);
    
    expect(datasetCheckbox).toBeChecked();
  });

  it('allows selecting all datasets', () => {
    render(<AnalyticsPage />);
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    expect(selectAllCheckbox).toBeChecked();
  });

  it('calls exportMlDataset when export button is clicked', async () => {
    mockUseAnalyticsData.mockReturnValue({
      ...mockAnalyticsData,
      exportMlDataset: vi.fn().mockResolvedValue({
        id: 'export-1',
        status: 'completed',
        downloadUrl: 'https://example.com/export.csv'
      })
    });
    
    render(<AnalyticsPage />);
    
    // Select a dataset first
    const datasetCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(datasetCheckbox);
    
    // Click export button
    const exportButton = screen.getByText('analytics.ml.export');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockAnalyticsData.exportMlDataset).toHaveBeenCalledWith({
        datasetIds: ['dataset-1'],
        format: 'csv',
        includeMetadata: true,
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      });
    });
  });

  it('calls triggerMlRetrain when retrain button is clicked', async () => {
    mockUseAnalyticsData.mockReturnValue({
      ...mockAnalyticsData,
      triggerMlRetrain: vi.fn().mockResolvedValue({
        jobId: 'retrain-1',
        status: 'started'
      })
    });
    
    render(<AnalyticsPage />);
    
    // Select a dataset first
    const datasetCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(datasetCheckbox);
    
    // Click retrain button
    const retrainButton = screen.getByText('analytics.ml.retrain');
    fireEvent.click(retrainButton);
    
    await waitFor(() => {
      expect(mockAnalyticsData.triggerMlRetrain).toHaveBeenCalledWith(['dataset-1']);
    });
  });

  it('shows export format selector', () => {
    render(<AnalyticsPage />);
    
    const formatSelect = screen.getByDisplayValue('analytics.ml.exportFormat.csv');
    expect(formatSelect).toBeInTheDocument();
  });

  it('disables export button when no datasets selected', () => {
    render(<AnalyticsPage />);
    
    const exportButton = screen.getByText('analytics.ml.export');
    expect(exportButton).toBeDisabled();
  });

  it('disables retrain button when no datasets selected', () => {
    render(<AnalyticsPage />);
    
    const retrainButton = screen.getByText('analytics.ml.retrain');
    expect(retrainButton).toBeDisabled();
  });

  it('shows error banner when there is an error', () => {
    const mockDataWithError = {
      ...mockAnalyticsData,
      error: 'Failed to load analytics data'
    };
    mockUseAnalyticsData.mockReturnValue(mockDataWithError);
    
    render(<AnalyticsPage />);
    
    expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument();
    expect(screen.getByText('common.dismiss')).toBeInTheDocument();
  });

  it('calls clearError when dismiss button is clicked', async () => {
    const mockDataWithError = {
      ...mockAnalyticsData,
      error: 'Failed to load analytics data'
    };
    mockUseAnalyticsData.mockReturnValue(mockDataWithError);
    
    render(<AnalyticsPage />);
    
    const dismissButton = screen.getByText('common.dismiss');
    fireEvent.click(dismissButton);
    
    await waitFor(() => {
      expect(mockAnalyticsData.clearError).toHaveBeenCalled();
    });
  });

  it('shows loading state when data is loading', () => {
    const mockDataLoading = {
      ...mockAnalyticsData,
      isLoading: true
    };
    mockUseAnalyticsData.mockReturnValue(mockDataLoading);
    
    render(<AnalyticsPage />);
    
    const refreshButton = screen.getByText('analytics.actions.refresh');
    expect(refreshButton).toBeDisabled();
  });

  it('shows last updated timestamp', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('shows no data message when no ML datasets', () => {
    const mockDataNoDatasets = {
      ...mockAnalyticsData,
      mlDatasets: []
    };
    mockUseAnalyticsData.mockReturnValue(mockDataNoDatasets);
    
    render(<AnalyticsPage />);
    
    expect(screen.getByText('analytics.noData')).toBeInTheDocument();
  });

  it('shows missing fields for datasets with missing_fields status', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('Missing: repair_time, technician_id')).toBeInTheDocument();
  });

  it('shows staleness days for stale datasets', () => {
    const mockDataWithStale = {
      ...mockAnalyticsData,
      mlDatasets: [
        {
          id: 'dataset-3',
          name: 'Old Dataset',
          status: 'stale' as const,
          lastUpdated: '2024-01-01T08:00:00Z',
          stalenessDays: 15,
          recordCount: 1000,
          fieldCount: 10,
          completeness: 75.0
        }
      ]
    };
    mockUseAnalyticsData.mockReturnValue(mockDataWithStale);
    
    render(<AnalyticsPage />);
    
    expect(screen.getByText('15 days old')).toBeInTheDocument();
  });
});
