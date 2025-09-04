export interface KpiData {
  id: string;
  name: string;
  value: number;
  unit: string;
  delta: number; // Percentage change from last period
  trend: 'up' | 'down' | 'stable';
  sparkline: number[]; // Last 7 days of data points
  lastUpdated: string;
  target?: number;
  status?: 'good' | 'warning' | 'critical';
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'heatmap';
  title: string;
  data: any;
  config: any;
}

export interface MlDatasetStatus {
  id: string;
  name: string;
  status: 'ready' | 'missing_fields' | 'stale';
  lastUpdated: string;
  missingFields?: string[];
  stalenessDays?: number;
  recordCount: number;
  completeness: number; // Percentage of complete records
}

export interface AnalyticsSummary {
  kpis: KpiData[];
  dateRange: {
    start: string;
    end: string;
    compareToPrevious: boolean;
  };
  lastUpdated: string;
}

export interface MileageVarianceData {
  date: string;
  plannedMileage: number;
  actualMileage: number;
  variance: number;
  efficiency: number;
  trainsInService: number;
  averageDelay: number;
}

export interface BrandingComplianceData {
  date: string;
  totalTrains: number;
  brandedTrains: number;
  complianceRate: number;
  pendingRenewals: number;
  completedRenewals: number;
  overdueRenewals: number;
}

export interface ShuntingHeatmapData {
  date: string;
  timeSlot: string;
  shuntingOperations: number;
  energyConsumption: number;
  averageDuration: number;
  efficiency: number;
  trainsMoved: number;
}

export interface MlExportRequest {
  datasetIds: string[];
  format: 'csv' | 'json' | 'parquet';
  includeMetadata: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface MlExportResponse {
  exportId: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
  recordCount?: number;
  fileSize?: string;
  expiresAt: string;
}
