export interface KpiData {
  id: string;
  name: string;
  value: number;
  unit: string;
  delta: number; // Percentage change from last period
  trend: 'up' | 'down' | 'stable';
  sparkline: number[]; // Last 7 days of data points
  lastUpdated: string;
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
  fieldCount: number;
  completeness: number; // Percentage of complete records
}

export interface AnalyticsSummary {
  kpis: KpiData[];
  charts: ChartData[];
  mlDatasets: MlDatasetStatus[];
  dateRange: {
    start: string;
    end: string;
    compareToPrevious: boolean;
  };
  lastUpdated: string;
}

export interface MileageVarianceData {
  week: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

export interface BrandingComplianceData {
  trainType: string;
  compliant: number;
  nonCompliant: number;
  total: number;
  complianceRate: number;
}

export interface ShuntingHeatmapData {
  track: string;
  hour: number;
  shuntingTime: number; // Minutes
  frequency: number;
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
  id: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
  recordCount?: number;
  fileSize?: number;
  expiresAt: string;
}
