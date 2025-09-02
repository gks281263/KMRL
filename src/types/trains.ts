export type TrainStatus = 'eligible' | 'blocked' | 'invalid' | 'all';

export type Department = 'RS' | 'Signalling' | 'Telecom' | 'all';

export type SortField = 'trainId' | 'certificateExpiry' | 'criticalJobs' | 'nonCriticalJobs' | 'mileage' | 'brandingDelivered' | 'lastDeepClean' | 'yardPosition';

export type SortDirection = 'asc' | 'desc';

export interface TrainRecord {
  trainId: string;
  certificate: {
    status: 'valid' | 'expired' | 'near_expiry' | 'missing';
    expiryDate: string;
    department: Department;
  };
  jobs: {
    critical: number;
    nonCritical: number;
    total: number;
  };
  mileage: {
    current: number;
    lastUpdate: string;
    unit: 'km';
  };
  branding: {
    delivered: number;
    target: number;
    percentage: number;
    contractId: string;
  };
  cleaning: {
    due: boolean;
    lastDeepClean: string;
    nextScheduled: string;
    bay?: string;
  };
  yardPosition: {
    track: string;
    bay?: string;
    coordinates?: string;
  };
  overrides: {
    active: boolean;
    count: number;
    details: OverrideDetail[];
  };
  status: TrainStatus;
  lastUpdated: string;
  sources: {
    maximo: boolean;
    cert: boolean;
    branding: boolean;
    iot: boolean;
    cleaning: boolean;
    yard: boolean;
    overrides: boolean;
  };
}

export interface OverrideDetail {
  id: string;
  note: string;
  effectiveUntil: string;
  createdBy: string;
  createdAt: string;
}

export interface TrainDetails extends TrainRecord {
  history: TrainHistoryEvent[];
  telemetry: TelemetryData[];
  xaiFactors: XAIFactor[];
  sourceEvidence: SourceEvidence;
}

export interface TrainHistoryEvent {
  id: string;
  timestamp: string;
  eventType: 'status_change' | 'override_added' | 'override_expired' | 'maintenance' | 'cleaning';
  description: string;
  source: string;
}

export interface TelemetryData {
  timestamp: string;
  mileage: number;
  speed: number;
  location: string;
  alerts: string[];
}

export interface XAIFactor {
  factor: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface SourceEvidence {
  maximo: {
    lastSync: string;
    jobCount: number;
    criticalJobs: string[];
  };
  cert: {
    lastSync: string;
    certificateNumber: string;
    issuingAuthority: string;
  };
  branding: {
    lastSync: string;
    contractDetails: string;
    hoursRemaining: number;
  };
  iot: {
    lastSync: string;
    sensorStatus: string;
    lastTelemetry: string;
  };
  cleaning: {
    lastSync: string;
    scheduleStatus: string;
    bayAssignment: string;
  };
  yard: {
    lastSync: string;
    trackCapacity: number;
    currentOccupancy: number;
  };
  overrides: {
    lastSync: string;
    activeOverrides: OverrideDetail[];
  };
}

export interface TrainsQueryParams {
  page: number;
  limit: number;
  filter?: {
    status?: TrainStatus;
    departments?: Department[];
    search?: string;
  };
  sort?: {
    field: SortField;
    direction: SortDirection;
  };
}

export interface TrainsResponse {
  data: TrainRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata: {
    snapshotTime: string;
    freshnessPercentage: number;
    deltaSinceSnapshot: number;
    lastUpdated: string;
  };
}

export interface TrainDetailsResponse {
  data: TrainDetails;
  success: boolean;
  timestamp: string;
}

export interface OverrideRequest {
  trainId: string;
  note: string;
  effectiveUntil: string;
}

export interface BatchActionRequest {
  trainIds: string[];
  action: 'force_include' | 'force_exclude' | 'bulk_override' | 'export';
  overrideDetails?: OverrideRequest;
}
