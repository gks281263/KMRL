import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnifiedDataModelPage } from './UnifiedDataModelPage';

// Mock the useTrainsQuery hook
vi.mock('@/hooks/useTrainsQuery', () => ({
  useTrainsQuery: () => ({
    trains: [
      {
        trainId: 'T001',
        certificate: {
          status: 'valid',
          expiryDate: '2025-12-15',
          department: 'RS',
        },
        jobs: {
          critical: 0,
          nonCritical: 2,
          total: 2,
        },
        mileage: {
          current: 1250,
          lastUpdate: '2025-09-02T22:00:00Z',
          unit: 'km',
        },
        branding: {
          delivered: 45,
          target: 50,
          percentage: 90,
          contractId: 'BR001',
        },
        cleaning: {
          due: false,
          lastDeepClean: '2025-08-28',
          nextScheduled: '2025-09-05',
          bay: 'A1',
        },
        yardPosition: {
          track: 'T1',
          bay: 'A1',
          coordinates: '12.9716,77.5946',
        },
        overrides: {
          active: false,
          count: 0,
          details: [],
        },
        status: 'eligible',
        lastUpdated: '2025-09-02T22:00:00Z',
        sources: {
          maximo: true,
          cert: true,
          branding: true,
          iot: true,
          cleaning: true,
          yard: true,
          overrides: true,
        },
      },
      {
        trainId: 'T002',
        certificate: {
          status: 'near_expiry',
          expiryDate: '2025-09-10',
          department: 'Signalling',
        },
        jobs: {
          critical: 1,
          nonCritical: 3,
          total: 4,
        },
        mileage: {
          current: 2100,
          lastUpdate: '2025-09-02T21:45:00Z',
          unit: 'km',
        },
        branding: {
          delivered: 38,
          target: 50,
          percentage: 76,
          contractId: 'BR002',
        },
        cleaning: {
          due: true,
          lastDeepClean: '2025-08-25',
          nextScheduled: '2025-09-03',
          bay: 'B2',
        },
        yardPosition: {
          track: 'T2',
          bay: 'B2',
          coordinates: '12.9716,77.5946',
        },
        overrides: {
          active: true,
          count: 1,
          details: [{
            id: 'OV001',
            note: 'Certificate extension pending',
            effectiveUntil: '2025-09-15',
            createdBy: 'supervisor',
            createdAt: '2025-09-01T10:00:00Z',
          }],
        },
        status: 'blocked',
        lastUpdated: '2025-09-02T21:45:00Z',
        sources: {
          maximo: true,
          cert: true,
          branding: true,
          iot: true,
          cleaning: true,
          yard: true,
          overrides: true,
        },
      },
    ],
    pagination: {
      page: 1,
      limit: 50,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    selectedTrains: new Set(),
    isLoading: false,
    queryParams: {
      page: 1,
      limit: 50,
      filter: {
        status: 'all',
        departments: ['all'],
        search: '',
      },
      sort: {
        field: 'trainId',
        direction: 'asc',
      },
    },
    updateFilters: vi.fn(),
    updateSort: vi.fn(),
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    toggleTrainSelection: vi.fn(),
    selectAllTrains: vi.fn(),
    clearSelection: vi.fn(),
    getTrainDetails: vi.fn().mockResolvedValue({
      trainId: 'T001',
      certificate: { status: 'valid', expiryDate: '2025-12-15', department: 'RS' },
      jobs: { critical: 0, nonCritical: 2, total: 2 },
      mileage: { current: 1250, lastUpdate: '2025-09-02T22:00:00Z', unit: 'km' },
      branding: { delivered: 45, target: 50, percentage: 90, contractId: 'BR001' },
      cleaning: { due: false, lastDeepClean: '2025-08-28', nextScheduled: '2025-09-05', bay: 'A1' },
      yardPosition: { track: 'T1', bay: 'A1', coordinates: '12.9716,77.5946' },
      overrides: { active: false, count: 0, details: [] },
      status: 'eligible',
      lastUpdated: '2025-09-02T22:00:00Z',
      sources: { maximo: true, cert: true, branding: true, iot: true, cleaning: true, yard: true, overrides: true },
      history: [],
      telemetry: [],
      xaiFactors: [],
      sourceEvidence: {},
    }),
  }),
}));

describe('UnifiedDataModelPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the unified data model page with all components', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('Unified Data Model')).toBeInTheDocument();
    expect(screen.getByText('Searchable, filterable view of all train records after ingestion')).toBeInTheDocument();
  });

  it('displays status filter badges with counts', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('All (2)')).toBeInTheDocument();
    expect(screen.getByText('Eligible (1)')).toBeInTheDocument();
    expect(screen.getByText('Blocked (1)')).toBeInTheDocument();
    expect(screen.getByText('Invalid (0)')).toBeInTheDocument();
  });

  it('displays department filter buttons', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('All Departments')).toBeInTheDocument();
    expect(screen.getByText('RS')).toBeInTheDocument();
    expect(screen.getByText('Signalling')).toBeInTheDocument();
    expect(screen.getByText('Telecom')).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByPlaceholderText('Search by Train ID...')).toBeInTheDocument();
  });

  it('displays train table with correct data', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('T001')).toBeInTheDocument();
    expect(screen.getByText('T002')).toBeInTheDocument();
    expect(screen.getByText('eligible')).toBeInTheDocument();
    expect(screen.getByText('blocked')).toBeInTheDocument();
  });

  it('displays certificate status correctly', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('valid')).toBeInTheDocument();
    expect(screen.getByText('near expiry')).toBeInTheDocument();
  });

  it('displays job counts correctly', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('0')).toBeInTheDocument(); // Critical jobs for T001
    expect(screen.getByText('2')).toBeInTheDocument(); // Non-critical jobs for T001
    expect(screen.getByText('1')).toBeInTheDocument(); // Critical jobs for T002
    expect(screen.getByText('3')).toBeInTheDocument(); // Non-critical jobs for T002
  });

  it('displays mileage information', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('1,250')).toBeInTheDocument(); // T001 mileage
    expect(screen.getByText('2,100')).toBeInTheDocument(); // T002 mileage
  });

  it('displays branding progress', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('45/50')).toBeInTheDocument(); // T001 branding
    expect(screen.getByText('38/50')).toBeInTheDocument(); // T002 branding
    expect(screen.getByText('90%')).toBeInTheDocument(); // T001 percentage
    expect(screen.getByText('76%')).toBeInTheDocument(); // T002 percentage
  });

  it('displays cleaning status', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('OK')).toBeInTheDocument(); // T001 cleaning
    expect(screen.getByText('DUE')).toBeInTheDocument(); // T002 cleaning
  });

  it('displays yard position', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('T1')).toBeInTheDocument(); // T001 track
    expect(screen.getByText('T2')).toBeInTheDocument(); // T002 track
    expect(screen.getByText('A1')).toBeInTheDocument(); // T001 bay
    expect(screen.getByText('B2')).toBeInTheDocument(); // T002 bay
  });

  it('displays override status', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('None')).toBeInTheDocument(); // T001 overrides
    expect(screen.getByText('1 Active')).toBeInTheDocument(); // T002 overrides
  });

  it('handles status filter clicks', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const eligibleButton = screen.getByText('Eligible (1)');
    await user.click(eligibleButton);

    // The mock updateFilters function should be called
    // This would be verified by checking the mock implementation
  });

  it('handles department filter clicks', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const rsButton = screen.getByText('RS');
    await user.click(rsButton);

    // The mock updateFilters function should be called
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const searchInput = screen.getByPlaceholderText('Search by Train ID...');
    await user.type(searchInput, 'T001');

    // The mock updateFilters function should be called
  });

  it('displays action buttons for each train', () => {
    render(<UnifiedDataModelPage />);

    const overrideButtons = screen.getAllByText('Override');
    const availableButtons = screen.getAllByText('Available');
    const unavailableButtons = screen.getAllByText('Unavailable');

    expect(overrideButtons).toHaveLength(2);
    expect(availableButtons).toHaveLength(2);
    expect(unavailableButtons).toHaveLength(2);
  });

  it('handles train row clicks to open drawer', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const trainRow = screen.getByText('T001').closest('tr');
    expect(trainRow).toBeInTheDocument();
    
    if (trainRow) {
      await user.click(trainRow);
    }

    // The drawer should open with train details
    await waitFor(() => {
      expect(screen.getByText('Train T001')).toBeInTheDocument();
    });
  });

  it('displays results summary', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('Showing 2 of 2 trains')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('shows stale snapshot banner when data is stale', () => {
    // Mock Math.random to return a value that triggers stale banner
    vi.spyOn(Math, 'random').mockReturnValue(0.8); // 80% chance of stale

    render(<UnifiedDataModelPage />);

    expect(screen.getByText('Stale Snapshot')).toBeInTheDocument();
    expect(screen.getByText('Data may be outdated. Consider refreshing the snapshot.')).toBeInTheDocument();
    expect(screen.getByText('Refresh Snapshot')).toBeInTheDocument();
  });

  it('handles refresh snapshot button click', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8);
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const refreshButton = screen.getByText('Refresh Snapshot');
    await user.click(refreshButton);

    // Banner should disappear
    await waitFor(() => {
      expect(screen.queryByText('Stale Snapshot')).not.toBeInTheDocument();
    });
  });

  it('displays column visibility menu', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const columnsButton = screen.getByText('Columns');
    await user.click(columnsButton);

    expect(screen.getByText('Visible Columns')).toBeInTheDocument();
    expect(screen.getByText('Train ID')).toBeInTheDocument();
    expect(screen.getByText('Certificate')).toBeInTheDocument();
    expect(screen.getByText('Critical Jobs')).toBeInTheDocument();
    expect(screen.getByText('Non-Critical Jobs')).toBeInTheDocument();
    expect(screen.getByText('Mileage')).toBeInTheDocument();
    expect(screen.getByText('Branding')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Yard Position')).toBeInTheDocument();
    expect(screen.getByText('Overrides')).toBeInTheDocument();
  });

  it('handles column visibility toggles', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const columnsButton = screen.getByText('Columns');
    await user.click(columnsButton);

    const trainIdCheckbox = screen.getByText('Train ID').previousElementSibling as HTMLInputElement;
    await user.click(trainIdCheckbox);

    // Column should be hidden
    expect(trainIdCheckbox.checked).toBe(false);
  });

  it('displays select all checkbox', () => {
    render(<UnifiedDataModelPage />);

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    expect(selectAllCheckbox).toBeInTheDocument();
  });

  it('displays selection count', () => {
    render(<UnifiedDataModelPage />);

    expect(screen.getByText('0 of 2 selected')).toBeInTheDocument();
  });

  it('handles individual train selection', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    const firstTrainCheckbox = checkboxes[1]; // First train checkbox (after select all)
    
    await user.click(firstTrainCheckbox);

    // The mock toggleTrainSelection function should be called
  });

  it('displays batch actions when trains are selected', () => {
    // Mock selectedTrains to have one train selected
    vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery).mockReturnValue({
      ...vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery)(),
      selectedTrains: new Set(['T001']),
    });

    render(<UnifiedDataModelPage />);

    expect(screen.getByText('1 of 2 selected')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Batch Actions')).toBeInTheDocument();
  });

  it('handles clear selection', async () => {
    const user = userEvent.setup();
    vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery).mockReturnValue({
      ...vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery)(),
      selectedTrains: new Set(['T001']),
    });

    render(<UnifiedDataModelPage />);

    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    // The mock clearSelection function should be called
  });

  it('displays sort indicators on sortable columns', () => {
    render(<UnifiedDataModelPage />);

    // Check for sort buttons
    expect(screen.getByText('Train ID')).toBeInTheDocument();
    expect(screen.getByText('Certificate')).toBeInTheDocument();
    expect(screen.getByText('Critical Jobs')).toBeInTheDocument();
    expect(screen.getByText('Non-Critical Jobs')).toBeInTheDocument();
    expect(screen.getByText('Mileage (km)')).toBeInTheDocument();
    expect(screen.getByText('Branding')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Yard Position')).toBeInTheDocument();
  });

  it('handles column sorting', async () => {
    const user = userEvent.setup();
    render(<UnifiedDataModelPage />);

    const mileageHeader = screen.getByText('Mileage (km)');
    await user.click(mileageHeader);

    // The mock updateSort function should be called
  });

  it('displays missing field indicators', () => {
    // Mock a train with missing data
    vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery).mockReturnValue({
      ...vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery)(),
      trains: [{
        trainId: 'T003',
        certificate: {
          status: 'missing',
          expiryDate: '',
          department: 'RS',
        },
        jobs: { critical: 0, nonCritical: 0, total: 0 },
        mileage: { current: 0, lastUpdate: '2025-09-02T22:00:00Z', unit: 'km' },
        branding: { delivered: 0, target: 0, percentage: 0, contractId: '' },
        cleaning: { due: false, lastDeepClean: '', nextScheduled: '' },
        yardPosition: { track: 'T3', coordinates: '12.9716,77.5946' },
        overrides: { active: false, count: 0, details: [] },
        status: 'invalid',
        lastUpdated: '2025-09-02T22:00:00Z',
        sources: { maximo: false, cert: false, branding: false, iot: false, cleaning: false, yard: true, overrides: true },
      }],
    });

    render(<UnifiedDataModelPage />);

    expect(screen.getByText('—')).toBeInTheDocument(); // Missing expiry date
  });

  it('handles loading state', () => {
    vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery).mockReturnValue({
      ...vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery)(),
      isLoading: true,
    });

    render(<UnifiedDataModelPage />);

    expect(screen.getByText('Loading trains...')).toBeInTheDocument();
  });

  it('handles empty results', () => {
    vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery).mockReturnValue({
      ...vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery)(),
      trains: [],
      pagination: { ...vi.mocked(require('@/hooks/useTrainsQuery').useTrainsQuery)().pagination, total: 0 },
    });

    render(<UnifiedDataModelPage />);

    expect(screen.getByText('No trains found matching your criteria')).toBeInTheDocument();
  });
});
