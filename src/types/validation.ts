export type ValidationRule = 
  | 'certificate_validity'
  | 'critical_jobcards_closed'
  | 'cleaning_schedule'
  | 'yard_capacity'
  | 'minimum_service_targets'
  | 'stabling_geometry';

export type ValidationStatus = 'invalid' | 'blocked' | 'eligible';

export interface ValidationRule {
  id: ValidationRule;
  name: string;
  description: string;
  category: 'certificate' | 'maintenance' | 'cleaning' | 'yard' | 'service';
  severity: 'critical' | 'warning' | 'info';
  department?: 'RS' | 'Signalling' | 'Telecom' | 'all';
}

export interface TrainValidationResult {
  trainId: string;
  status: ValidationStatus;
  reasons: ValidationRule[];
  evidence: ValidationEvidence;
  lastValidated: string;
  overrides: Override[];
}

export interface ValidationEvidence {
  certificate?: {
    status: 'valid' | 'expired' | 'missing';
    expiryDate: string;
    department: string;
    certificateNumber: string;
    issuingAuthority: string;
    fileUrl?: string;
  };
  maximo?: {
    criticalJobs: number;
    openJobs: number;
    jobDetails: JobDetail[];
    lastSync: string;
  };
  cleaning?: {
    due: boolean;
    lastDeepClean: string;
    nextScheduled: string;
    availableSlots: CleaningSlot[];
    bayAssignment?: string;
  };
  yard?: {
    currentCapacity: number;
    maxCapacity: number;
    trackAvailability: TrackAvailability[];
    stablingGeometry: StablingGeometry;
    lastUpdate: string;
  };
  service?: {
    currentServiceTrains: number;
    minimumRequired: number;
    standbyTarget: number;
    currentStandby: number;
  };
}

export interface JobDetail {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'closed';
  assignedTo?: string;
  dueDate: string;
  maximoUrl?: string;
}

export interface CleaningSlot {
  bay: string;
  available: boolean;
  scheduledTime: string;
  duration: number; // minutes
}

export interface TrackAvailability {
  track: string;
  available: boolean;
  currentTrain?: string;
  capacity: number;
  geometry: string;
}

export interface StablingGeometry {
  track: string;
  bay: string;
  feasible: boolean;
  constraints: string[];
  alternativePositions: string[];
}

export interface Override {
  id: string;
  trainId: string;
  rule: ValidationRule;
  reason: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'expired';
}

export interface OverrideRequest {
  trainId: string;
  rule: ValidationRule;
  reason: string;
  expiresAt: string;
}

export interface ValidationRunResponse {
  invalid: TrainValidationResult[];
  blocked: TrainValidationResult[];
  eligible: string[]; // Just train IDs for eligible trains
  summary: {
    totalTrains: number;
    invalidCount: number;
    blockedCount: number;
    eligibleCount: number;
    lastRun: string;
    duration: number; // seconds
  };
}

export interface ValidationRunRequest {
  forceRefresh?: boolean;
  includeEvidence?: boolean;
}

export interface RemediationChecklist {
  trainId: string;
  recommendations: RemediationItem[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  requiredApprovals: string[];
}

export interface RemediationItem {
  action: string;
  description: string;
  responsible: string;
  estimatedTime: string;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface EscalationRequest {
  reason: 'all_trains_invalid' | 'insufficient_eligible' | 'critical_blockage';
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  attachments?: string[];
}
