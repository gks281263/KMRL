import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '@/services/api/analytics';
import { 
  AnalyticsSummary, 
  MlDatasetStatus, 
  MlExportRequest, 
  MlExportResponse,
  MileageVarianceData,
  BrandingComplianceData,
  ShuntingHeatmapData
} from '@/types/analytics';

export interface UseAnalyticsDataReturn {
  // Data
  summary: AnalyticsSummary | null;
  mlDatasets: MlDatasetStatus[];
  mileageData: MileageVarianceData[];
  brandingData: BrandingComplianceData[];
  shuntingData: ShuntingHeatmapData[];
  
  // Loading states
  isLoading: boolean;
  isChartLoading: boolean;
  isExporting: boolean;
  lastUpdated: string | null;
  
  // Date range
  dateRange: {
    start: string;
    end: string;
    compareToPrevious: boolean;
  };
  
  // Actions
  refreshData: () => Promise<void>;
  updateDateRange: (start: string, end: string, compareToPrevious?: boolean) => Promise<void>;
  exportMlDataset: (request: MlExportRequest) => Promise<MlExportResponse>;
  triggerMlRetrain: (datasetIds: string[]) => Promise<{ jobId: string; status: string }>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useAnalyticsData = (): UseAnalyticsDataReturn => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [mlDatasets, setMlDatasets] = useState<MlDatasetStatus[]>([]);
  const [mileageData, setMileageData] = useState<MileageVarianceData[]>([]);
  const [brandingData, setBrandingData] = useState<BrandingComplianceData[]>([]);
  const [shuntingData, setShuntingData] = useState<ShuntingHeatmapData[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
    compareToPrevious: false
  });

  // Load initial data
  const loadData = useCallback(async (
    startDate?: string, 
    endDate?: string, 
    compareToPrevious: boolean = false
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [summaryResponse, mlDatasetsResponse] = await Promise.all([
        analyticsApi.getAnalyticsSummary(startDate, endDate, compareToPrevious),
        analyticsApi.getMlDatasetsStatus()
      ]);

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
        setDateRange(summaryResponse.data.dateRange);
      }
      
      if (mlDatasetsResponse.success) {
        setMlDatasets(mlDatasetsResponse.data);
      }
      
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load chart data
  const loadChartData = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsChartLoading(true);
      
      const [mileageResponse, brandingResponse, shuntingResponse] = await Promise.all([
        analyticsApi.getMileageVarianceData(startDate, endDate),
        analyticsApi.getBrandingComplianceData(startDate, endDate),
        analyticsApi.getShuntingHeatmapData(startDate, endDate)
      ]);

      if (mileageResponse.success) {
        setMileageData(mileageResponse.data);
      }
      
      if (brandingResponse.success) {
        setBrandingData(brandingResponse.data);
      }
      
      if (shuntingResponse.success) {
        setShuntingData(shuntingResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadData(dateRange.start, dateRange.end, dateRange.compareToPrevious);
  }, []);

  // Load chart data when date range changes
  useEffect(() => {
    if (!isLoading) {
      loadChartData(dateRange.start, dateRange.end);
    }
  }, [dateRange, isLoading, loadChartData]);

  // Actions
  const refreshData = useCallback(async () => {
    await loadData(dateRange.start, dateRange.end, dateRange.compareToPrevious);
  }, [loadData, dateRange]);

  const updateDateRange = useCallback(async (
    start: string, 
    end: string, 
    compareToPrevious: boolean = false
  ) => {
    setDateRange({ start, end, compareToPrevious });
    await loadData(start, end, compareToPrevious);
  }, [loadData]);

  const exportMlDataset = useCallback(async (request: MlExportRequest): Promise<MlExportResponse> => {
    try {
      setIsExporting(true);
      setError(null);
      
      const response = await analyticsApi.exportMlDataset(request);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to export ML dataset');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export ML dataset';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const triggerMlRetrain = useCallback(async (datasetIds: string[]) => {
    try {
      setError(null);
      
      const response = await analyticsApi.triggerMlRetrain(datasetIds);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to trigger ML retrain');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger ML retrain';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    summary,
    mlDatasets,
    mileageData,
    brandingData,
    shuntingData,
    isLoading,
    isChartLoading,
    isExporting,
    lastUpdated,
    dateRange,
    refreshData,
    updateDateRange,
    exportMlDataset,
    triggerMlRetrain,
    error,
    clearError
  };
};
