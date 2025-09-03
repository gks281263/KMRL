export interface OptimizationResult {
  service: ServiceTrain[];
  standby: StandbyTrain[];
  maintenance: MaintenanceTrain[];
  yardMap: YardMapData;
  meta: {
    jobId: string;
    timestamp: string;
    feasibilityScore: number;
    totalTrains: number;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    requiredApprovals: string[];
  };
}

export interface ServiceTrain {
  trainId: string;
  startTime: string;
  routeId: string;
  rationale: string[];
  assignedTrack?: string;
  estimatedDuration: number;
  priority: number;
}

export interface StandbyTrain {
  trainId: string;
  priorityRank: number;
  triggerCondition: string;
  standbyLocation: string;
  estimatedStandbyTime: number;
  alternativeRoutes: string[];
}

export interface MaintenanceTrain {
  trainId: string;
  bay: string;
  plannedWork: string;
  eta: string;
  estimatedDuration: number;
  maintenanceType: 'scheduled' | 'emergency' | 'inspection';
  assignedTechnicians: string[];
}

export interface YardMapData {
  tracks: Track[];
  paths: ShuntingPath[];
  trains: TrackedTrain[];
}

export interface Track {
  id: string;
  name: string;
  x: number;
  y: number;
  length: number;
  width: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  assignedTrain?: string;
}

export interface ShuntingPath {
  id: string;
  fromTrack: string;
  toTrack: string;
  path: Array<{ x: number; y: number }>;
  estimatedTime: number;
  conflicts: string[];
}

export interface TrackedTrain {
  id: string;
  trackId: string;
  position: { x: number; y: number };
  assignedTask: string;
  shuntingPath?: string;
  status: 'stationary' | 'moving' | 'loading' | 'unloading';
}

export interface ContributingFactor {
  factor: string;
  weight: number;
  evidence: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ExplainabilityData {
  trainId: string;
  factors: ContributingFactor[];
  totalScore: number;
  constraints: string[];
  recommendations: string[];
}

export interface PlanSummary {
  punctuality: number; // percentage
  energy: number; // efficiency score
  brandingHours: number; // total hours
  totalTrains: number;
  estimatedSavings: number;
}

export interface WhatIfScenario {
  forceInclude: string[];
  forceExclude: string[];
  weightMods: {
    branding?: number;
    mileage?: number;
    shunting?: number;
    risk?: number;
  };
}

export interface KPIDelta {
  punctuality: number; // delta percentage
  energy: number; // delta efficiency score
  brandingHours: number; // delta hours
  impact: 'improved' | 'worsened' | 'unchanged';
}

export interface PreviewResult {
  kpiDelta: KPIDelta;
  topAssignments: Array<{
    trainId: string;
    newRank: number;
    previousRank: number;
    reason: string;
  }>;
  estimatedRuntime: number;
  confidence: number;
}

export interface ApprovalRequest {
  reason: string;
  digitalSignature?: string;
  password?: string;
  timestamp: string;
  approverId: string;
}

export interface XAIAnalysis {
  trainId: string;
  factorWeights: ContributingFactor[];
  constraintViolations: Array<{
    constraint: string;
    severity: 'low' | 'medium' | 'high';
    impact: string;
  }>;
  alternativeRanks: Array<{
    scenario: string;
    rank: number;
    score: number;
    factors: string[];
  }>;
  recommendations: string[];
}
