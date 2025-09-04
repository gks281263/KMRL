import { 
  AnalyticsSummary, 
  MlDatasetStatus, 
  MlExportRequest, 
  MlExportResponse,
  MileageVarianceData,
  BrandingComplianceData,
  ShuntingHeatmapData,
  KpiData
} from '@/types/analytics';
import { ApiResponse } from '@/types/common';

// Mock data generators
const generateMileageVarianceData = (startDate: string, endDate: string): MileageVarianceData[] => {
  const data: MileageVarianceData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(daysDiff, 30); i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    const planned = Math.floor(Math.random() * 200) + 800; // 800-1000 km
    const actual = planned + Math.floor(Math.random() * 50) - 25; // -25 to +25 km variance
    const variance = actual - planned;
    
    data.push({
      date: date.toISOString().split('T')[0],
      plannedMileage: planned,
      actualMileage: actual,
      variance: variance,
      efficiency: Math.floor(Math.random() * 20) + 80, // 80-100% efficiency
      trainsInService: Math.floor(Math.random() * 10) + 15, // 15-25 trains
      averageDelay: Math.floor(Math.random() * 10) + 2, // 2-12 minutes
    });
  }
  
  return data;
};

const generateBrandingComplianceData = (startDate: string, endDate: string): BrandingComplianceData[] => {
  const data: BrandingComplianceData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(daysDiff, 30); i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalTrains: Math.floor(Math.random() * 5) + 20, // 20-25 trains
      brandedTrains: Math.floor(Math.random() * 3) + 18, // 18-21 branded
      complianceRate: Math.floor(Math.random() * 15) + 85, // 85-100%
      pendingRenewals: Math.floor(Math.random() * 3) + 1, // 1-4 pending
      completedRenewals: Math.floor(Math.random() * 2) + 1, // 1-3 completed
      overdueRenewals: Math.floor(Math.random() * 2), // 0-2 overdue
    });
  }
  
  return data;
};

const generateShuntingHeatmapData = (startDate: string, endDate: string): ShuntingHeatmapData[] => {
  const data: ShuntingHeatmapData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const timeSlots = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  for (let i = 0; i < Math.min(daysDiff, 7); i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    timeSlots.forEach(timeSlot => {
      data.push({
        date: date.toISOString().split('T')[0],
        timeSlot,
        shuntingOperations: Math.floor(Math.random() * 15) + 5, // 5-20 operations
        energyConsumption: Math.floor(Math.random() * 200) + 100, // 100-300 kWh
        averageDuration: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        efficiency: Math.floor(Math.random() * 20) + 75, // 75-95%
        trainsMoved: Math.floor(Math.random() * 8) + 3, // 3-11 trains
      });
    });
  }
  
  return data;
};

const generateKpis = (compareToPrevious: boolean = false): KpiData[] => {
  const baseKpis: KpiData[] = [
    {
      id: 'punctuality',
      name: 'Punctuality',
      value: 94.2,
      unit: '%',
      delta: compareToPrevious ? 2.1 : 0,
      trend: 'up',
      sparkline: [92.1, 93.5, 94.2, 93.8, 94.5, 94.2, 94.8],
      lastUpdated: new Date().toISOString(),
      target: 95.0,
      status: 'good'
    },
    {
      id: 'mileage_variance',
      name: 'Mileage Variance',
      value: 12.5,
      unit: 'km',
      delta: compareToPrevious ? -3.2 : 0,
      trend: 'down',
      sparkline: [15.8, 14.2, 12.5, 13.1, 11.9, 12.5, 10.8],
      lastUpdated: new Date().toISOString(),
      target: 10.0,
      status: 'warning'
    },
    {
      id: 'branding_compliance',
      name: 'Branding Compliance',
      value: 91.5,
      unit: '%',
      delta: compareToPrevious ? 1.8 : 0,
      trend: 'up',
      sparkline: [89.7, 90.2, 91.5, 90.8, 91.2, 91.5, 92.1],
      lastUpdated: new Date().toISOString(),
      target: 95.0,
      status: 'warning'
    },
    {
      id: 'cleaning_compliance',
      name: 'Cleaning Compliance',
      value: 96.8,
      unit: '%',
      delta: compareToPrevious ? 0.5 : 0,
      trend: 'up',
      sparkline: [96.3, 96.5, 96.8, 96.6, 96.9, 96.8, 97.1],
      lastUpdated: new Date().toISOString(),
      target: 95.0,
      status: 'good'
    },
    {
      id: 'shunting_efficiency',
      name: 'Shunting Efficiency',
      value: 87.3,
      unit: '%',
      delta: compareToPrevious ? -1.2 : 0,
      trend: 'down',
      sparkline: [88.5, 87.8, 87.3, 87.9, 86.8, 87.3, 86.1],
      lastUpdated: new Date().toISOString(),
      target: 90.0,
      status: 'warning'
    }
  ];

  return baseKpis;
};

const generateMlDatasets = (): MlDatasetStatus[] => {
  return [
    {
      id: 'train_operations',
      name: 'Train Operations Dataset',
      status: 'ready',
      recordCount: 125430,
      completeness: 98.5,
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      missingFields: [],
      stalenessDays: 0
    },
    {
      id: 'maintenance_records',
      name: 'Maintenance Records Dataset',
      status: 'missing_fields',
      recordCount: 89420,
      completeness: 87.2,
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      missingFields: ['fault_code', 'repair_duration'],
      stalenessDays: 0
    },
    {
      id: 'branding_contracts',
      name: 'Branding Contracts Dataset',
      status: 'ready',
      recordCount: 3420,
      completeness: 99.1,
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      missingFields: [],
      stalenessDays: 0
    },
    {
      id: 'yard_operations',
      name: 'Yard Operations Dataset',
      status: 'stale',
      recordCount: 67890,
      completeness: 92.8,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      missingFields: [],
      stalenessDays: 2
    },
    {
      id: 'cleaning_schedules',
      name: 'Cleaning Schedules Dataset',
      status: 'ready',
      recordCount: 15680,
      completeness: 96.3,
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      missingFields: [],
      stalenessDays: 0
    }
  ];
};

// Mock API functions
export const mockAnalyticsApi = {
  async getAnalyticsSummary(
    startDate?: string, 
    endDate?: string, 
    compareToPrevious: boolean = false
  ): Promise<ApiResponse<AnalyticsSummary>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const summary: AnalyticsSummary = {
      kpis: generateKpis(compareToPrevious),
      dateRange: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: endDate || new Date().toISOString().split('T')[0],
        compareToPrevious
      },
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      data: summary,
      message: 'Analytics summary loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getMlDatasetsStatus(): Promise<ApiResponse<MlDatasetStatus[]>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateMlDatasets(),
      message: 'ML datasets status loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getMileageVarianceData(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<MileageVarianceData[]>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: generateMileageVarianceData(startDate, endDate),
      message: 'Mileage variance data loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getBrandingComplianceData(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<BrandingComplianceData[]>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: generateBrandingComplianceData(startDate, endDate),
      message: 'Branding compliance data loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getShuntingHeatmapData(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<ShuntingHeatmapData[]>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: generateShuntingHeatmapData(startDate, endDate),
      message: 'Shunting heatmap data loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async exportMlDataset(request: MlExportRequest): Promise<ApiResponse<MlExportResponse>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      data: {
        exportId,
        downloadUrl: `#mock-download-${exportId}`,
        status: 'completed',
        recordCount: request.datasetIds.length * 10000, // Mock record count
        fileSize: `${Math.floor(Math.random() * 50) + 10}MB`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      },
      message: 'ML dataset export completed successfully',
      timestamp: new Date().toISOString()
    };
  },

  async triggerMlRetrain(datasetIds: string[]): Promise<ApiResponse<{ jobId: string; status: string }>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const jobId = `retrain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      data: {
        jobId,
        status: 'started'
      },
      message: 'ML retrain job started successfully',
      timestamp: new Date().toISOString()
    };
  },

  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      message: 'Analytics service is healthy',
      timestamp: new Date().toISOString()
    };
  }
};
