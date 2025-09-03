export interface ServiceDeparture {
  id: string;
  trainId: string;
  routeId: string;
  plannedDeparture: string; // ISO 8601 timestamp
  actualDeparture?: string; // ISO 8601 timestamp
  variance?: number; // milliseconds
  status: 'scheduled' | 'boarding' | 'departed' | 'delayed' | 'cancelled' | 'fault';
  platform?: string;
  destination: string;
  isBoarded: boolean;
  hasFault: boolean;
  lastUpdated: string; // ISO 8601 timestamp
}

export interface Incident {
  id: string;
  trainId: string;
  serviceId: string;
  type: 'mechanical' | 'electrical' | 'operational' | 'safety' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  faultCode?: string;
  reportedAt: string; // ISO 8601 timestamp
  reportedBy: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolvedAt?: string; // ISO 8601 timestamp
  resolvedBy?: string;
}

export interface StandbyTrain {
  id: string;
  trainId: string;
  location: string;
  status: 'available' | 'deployed' | 'maintenance' | 'reserved';
  capacity: number;
  lastMaintenance: string; // ISO 8601 timestamp
  nextMaintenance: string; // ISO 8601 timestamp
  priority: number; // 1-5, 1 being highest priority
}

export interface StandbyDeployment {
  id: string;
  standbyTrainId: string;
  replacementForServiceId: string;
  replacementForTrainId: string;
  deployedAt: string; // ISO 8601 timestamp
  deployedBy: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  estimatedArrival?: string; // ISO 8601 timestamp
  actualArrival?: string; // ISO 8601 timestamp
  notes?: string;
}

export interface AutoDeployPolicy {
  enabled: boolean;
  thresholdMinutes: number; // Auto-deploy if delay exceeds this
  maxStandbyUsage: number; // Maximum number of standby trains to use
  requireConfirmation: boolean;
  notifyStakeholders: boolean;
}

export interface Notification {
  id: string;
  type: 'incident' | 'deployment' | 'system' | 'alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string; // ISO 8601 timestamp
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface OperationsSnapshot {
  timestamp: string; // ISO 8601 timestamp
  totalServices: number;
  onTimeServices: number;
  delayedServices: number;
  cancelledServices: number;
  activeIncidents: number;
  availableStandby: number;
  deployedStandby: number;
  systemStatus: 'operational' | 'degraded' | 'critical';
}

export interface FaultTemplate {
  id: string;
  code: string;
  description: string;
  category: 'mechanical' | 'electrical' | 'operational' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  commonSolutions: string[];
  estimatedResolutionTime: number; // minutes
}

export interface WebSocketMessage {
  type: 'departure_update' | 'incident_created' | 'incident_updated' | 'standby_deployed' | 'system_status';
  data: ServiceDeparture | Incident | StandbyDeployment | OperationsSnapshot;
  timestamp: string;
}
