import { useState, useCallback, useMemo } from 'react';
import { TrainRecord, TrainsQueryParams, TrainStatus, Department, SortField, SortDirection, TrainDetails } from '@/types/trains';

// Mock data for MVP
const mockTrains: TrainRecord[] = [
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
  {
    trainId: 'T003',
    certificate: {
      status: 'expired',
      expiryDate: '2025-08-20',
      department: 'Telecom',
    },
    jobs: {
      critical: 3,
      nonCritical: 1,
      total: 4,
    },
    mileage: {
      current: 1800,
      lastUpdate: '2025-09-02T21:30:00Z',
      unit: 'km',
    },
    branding: {
      delivered: 25,
      target: 50,
      percentage: 50,
      contractId: 'BR003',
    },
    cleaning: {
      due: false,
      lastDeepClean: '2025-08-30',
      nextScheduled: '2025-09-07',
    },
    yardPosition: {
      track: 'T3',
      coordinates: '12.9716,77.5946',
    },
    overrides: {
      active: false,
      count: 0,
      details: [],
    },
    status: 'invalid',
    lastUpdated: '2025-09-02T21:30:00Z',
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
    trainId: 'T004',
    certificate: {
      status: 'missing',
      expiryDate: '',
      department: 'RS',
    },
    jobs: {
      critical: 0,
      nonCritical: 0,
      total: 0,
    },
    mileage: {
      current: 0,
      lastUpdate: '2025-09-02T22:00:00Z',
      unit: 'km',
    },
    branding: {
      delivered: 0,
      target: 0,
      percentage: 0,
      contractId: '',
    },
    cleaning: {
      due: false,
      lastDeepClean: '',
      nextScheduled: '',
    },
    yardPosition: {
      track: 'T4',
      coordinates: '12.9716,77.5946',
    },
    overrides: {
      active: false,
      count: 0,
      details: [],
    },
    status: 'invalid',
    lastUpdated: '2025-09-02T22:00:00Z',
    sources: {
      maximo: false,
      cert: false,
      branding: false,
      iot: false,
      cleaning: false,
      yard: true,
      overrides: true,
    },
  },
  {
    trainId: 'T005',
    certificate: {
      status: 'valid',
      expiryDate: '2026-01-15',
      department: 'Signalling',
    },
    jobs: {
      critical: 0,
      nonCritical: 1,
      total: 1,
    },
    mileage: {
      current: 950,
      lastUpdate: '2025-09-02T21:55:00Z',
      unit: 'km',
    },
    branding: {
      delivered: 50,
      target: 50,
      percentage: 100,
      contractId: 'BR005',
    },
    cleaning: {
      due: false,
      lastDeepClean: '2025-09-01',
      nextScheduled: '2025-09-08',
      bay: 'C3',
    },
    yardPosition: {
      track: 'T5',
      bay: 'C3',
      coordinates: '12.9716,77.5946',
    },
    overrides: {
      active: false,
      count: 0,
      details: [],
    },
    status: 'eligible',
    lastUpdated: '2025-09-02T21:55:00Z',
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
];

export function useTrainsQuery() {
  const [queryParams, setQueryParams] = useState<TrainsQueryParams>({
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
  });

  const [selectedTrains, setSelectedTrains] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort trains based on query params
  const filteredTrains = useMemo(() => {
    let filtered = [...mockTrains];

    // Apply status filter
    if (queryParams.filter?.status && queryParams.filter.status !== 'all') {
      filtered = filtered.filter(train => train.status === queryParams.filter!.status);
    }

    // Apply department filter
    if (queryParams.filter?.departments && !queryParams.filter.departments.includes('all')) {
      filtered = filtered.filter(train => 
        queryParams.filter!.departments!.includes(train.certificate.department)
      );
    }

    // Apply search filter
    if (queryParams.filter?.search) {
      const searchTerm = queryParams.filter.search.toLowerCase();
      filtered = filtered.filter(train => 
        train.trainId.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (queryParams.sort) {
      filtered.sort((a, b) => {
        const { field, direction } = queryParams.sort!;
        let aValue: any, bValue: any;

        switch (field) {
          case 'trainId':
            aValue = a.trainId;
            bValue = b.trainId;
            break;
          case 'certificateExpiry':
            aValue = new Date(a.certificate.expiryDate);
            bValue = new Date(b.certificate.expiryDate);
            break;
          case 'criticalJobs':
            aValue = a.jobs.critical;
            bValue = b.jobs.critical;
            break;
          case 'nonCriticalJobs':
            aValue = a.jobs.nonCritical;
            bValue = b.jobs.nonCritical;
            break;
          case 'mileage':
            aValue = a.mileage.current;
            bValue = b.mileage.current;
            break;
          case 'brandingDelivered':
            aValue = a.branding.delivered;
            bValue = b.branding.delivered;
            break;
          case 'lastDeepClean':
            aValue = new Date(a.cleaning.lastDeepClean);
            bValue = new Date(b.cleaning.lastDeepClean);
            break;
          case 'yardPosition':
            aValue = a.yardPosition.track;
            bValue = b.yardPosition.track;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [queryParams]);

  // Paginate results
  const paginatedTrains = useMemo(() => {
    const startIndex = (queryParams.page - 1) * queryParams.limit;
    const endIndex = startIndex + queryParams.limit;
    return filteredTrains.slice(startIndex, endIndex);
  }, [filteredTrains, queryParams.page, queryParams.limit]);

  // Calculate pagination info
  const pagination = useMemo(() => ({
    page: queryParams.page,
    limit: queryParams.limit,
    total: filteredTrains.length,
    totalPages: Math.ceil(filteredTrains.length / queryParams.limit),
    hasNext: queryParams.page < Math.ceil(filteredTrains.length / queryParams.limit),
    hasPrev: queryParams.page > 1,
  }), [filteredTrains.length, queryParams.page, queryParams.limit]);

  // Update query parameters
  const updateQueryParams = useCallback((updates: Partial<TrainsQueryParams>) => {
    setQueryParams(prev => ({
      ...prev,
      ...updates,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  // Update filters
  const updateFilters = useCallback((filters: Partial<TrainsQueryParams['filter']>) => {
    setQueryParams(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        ...filters,
      },
      page: 1,
    }));
  }, []);

  // Update sorting
  const updateSort = useCallback((field: SortField, direction: SortDirection) => {
    setQueryParams(prev => ({
      ...prev,
      sort: { field, direction },
    }));
  }, []);

  // Pagination controls
  const goToPage = useCallback((page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.hasPrev, pagination.page, goToPage]);

  // Selection controls
  const toggleTrainSelection = useCallback((trainId: string) => {
    setSelectedTrains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trainId)) {
        newSet.delete(trainId);
      } else {
        newSet.add(trainId);
      }
      return newSet;
    });
  }, []);

  const selectAllTrains = useCallback(() => {
    setSelectedTrains(new Set(paginatedTrains.map(train => train.trainId)));
  }, [paginatedTrains]);

  const clearSelection = useCallback(() => {
    setSelectedTrains(new Set());
  }, []);

  // Mock API call for train details
  const getTrainDetails = useCallback(async (trainId: string): Promise<TrainDetails> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const train = mockTrains.find(t => t.trainId === trainId);
    if (!train) {
      throw new Error('Train not found');
    }

    // Mock detailed data
    const details: TrainDetails = {
      ...train,
      history: [
        {
          id: '1',
          timestamp: '2025-09-02T22:00:00Z',
          eventType: 'status_change',
          description: 'Status changed to eligible',
          source: 'system',
        },
        {
          id: '2',
          timestamp: '2025-09-02T21:45:00Z',
          eventType: 'maintenance',
          description: 'Routine maintenance completed',
          source: 'maximo',
        },
      ],
      telemetry: [
        {
          timestamp: '2025-09-02T22:00:00Z',
          mileage: train.mileage.current,
          speed: 0,
          location: train.yardPosition.track,
          alerts: [],
        },
      ],
      xaiFactors: [
        {
          factor: 'Certificate Status',
          weight: 0.4,
          impact: 'positive',
          description: 'Valid certificate with 3+ months remaining',
        },
        {
          factor: 'Critical Jobs',
          weight: 0.3,
          impact: 'positive',
          description: 'No critical maintenance jobs pending',
        },
        {
          factor: 'Branding Compliance',
          weight: 0.2,
          impact: 'positive',
          description: '90% of target hours delivered',
        },
      ],
      sourceEvidence: {
        maximo: {
          lastSync: '2025-09-02T21:55:00Z',
          jobCount: train.jobs.total,
          criticalJobs: [],
        },
        cert: {
          lastSync: '2025-09-02T21:50:00Z',
          certificateNumber: `CERT-${train.trainId}`,
          issuingAuthority: 'Railway Board',
        },
        branding: {
          lastSync: '2025-09-02T21:45:00Z',
          contractDetails: `Contract ${train.branding.contractId}`,
          hoursRemaining: train.branding.target - train.branding.delivered,
        },
        iot: {
          lastSync: '2025-09-02T22:00:00Z',
          sensorStatus: 'operational',
          lastTelemetry: '2025-09-02T22:00:00Z',
        },
        cleaning: {
          lastSync: '2025-09-02T21:40:00Z',
          scheduleStatus: 'scheduled',
          bayAssignment: train.cleaning.bay || 'N/A',
        },
        yard: {
          lastSync: '2025-09-02T21:35:00Z',
          trackCapacity: 100,
          currentOccupancy: 75,
        },
        overrides: {
          lastSync: '2025-09-02T21:30:00Z',
          activeOverrides: train.overrides.details,
        },
      },
    };

    setIsLoading(false);
    return details;
  }, []);

  return {
    // Data
    trains: paginatedTrains,
    pagination,
    selectedTrains,
    isLoading,
    
    // Query params
    queryParams,
    
    // Actions
    updateQueryParams,
    updateFilters,
    updateSort,
    goToPage,
    nextPage,
    prevPage,
    toggleTrainSelection,
    selectAllTrains,
    clearSelection,
    getTrainDetails,
  };
}
