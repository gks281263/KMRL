import { useState, useEffect, useCallback } from 'react';
import { operationsSocket, OperationsSocketCallbacks } from '@/services/api/opsSocket';
import { operationsApi } from '@/services/api/operations';
import { 
  ServiceDeparture, 
  Incident, 
  StandbyTrain, 
  StandbyDeployment, 
  OperationsSnapshot,
  AutoDeployPolicy 
} from '@/types/operations';

export interface UseOperationsDataReturn {
  // Data
  departures: ServiceDeparture[];
  incidents: Incident[];
  standbyTrains: StandbyTrain[];
  standbyDeployments: StandbyDeployment[];
  snapshot: OperationsSnapshot | null;
  autoDeployPolicy: AutoDeployPolicy | null;
  
  // Loading states
  isLoading: boolean;
  isConnected: boolean;
  lastUpdated: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  markBoarded: (departureId: string) => Promise<void>;
  reportIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'status'>) => Promise<void>;
  deployStandby: (standbyTrainId: string, replacementForServiceId: string, autoDeploy?: boolean) => Promise<void>;
  updateAutoDeployPolicy: (policy: AutoDeployPolicy) => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useOperationsData = (): UseOperationsDataReturn => {
  const [departures, setDepartures] = useState<ServiceDeparture[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [standbyTrains, setStandbyTrains] = useState<StandbyTrain[]>([]);
  const [standbyDeployments, setStandbyDeployments] = useState<StandbyDeployment[]>([]);
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [autoDeployPolicy, setAutoDeployPolicy] = useState<AutoDeployPolicy | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [
        departuresResponse,
        incidentsResponse,
        standbyTrainsResponse,
        standbyDeploymentsResponse,
        snapshotResponse,
        policyResponse
      ] = await Promise.all([
        operationsApi.getServiceDepartures(),
        operationsApi.getIncidents(),
        operationsApi.getStandbyTrains(),
        operationsApi.getStandbyDeployments(),
        operationsApi.getOperationsSnapshot(),
        operationsApi.getAutoDeployPolicy()
      ]);

      if (departuresResponse.success) setDepartures(departuresResponse.data);
      if (incidentsResponse.success) setIncidents(incidentsResponse.data);
      if (standbyTrainsResponse.success) setStandbyTrains(standbyTrainsResponse.data);
      if (standbyDeploymentsResponse.success) setStandbyDeployments(standbyDeploymentsResponse.data);
      if (snapshotResponse.success) setSnapshot(snapshotResponse.data);
      if (policyResponse.success) setAutoDeployPolicy(policyResponse.data);
      
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operations data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket callbacks
  const socketCallbacks: OperationsSocketCallbacks = {
    onDepartureUpdate: (departure) => {
      setDepartures(prev => 
        prev.map(d => d.id === departure.id ? departure : d)
      );
      setLastUpdated(new Date().toISOString());
    },
    
    onIncidentCreated: (incident) => {
      setIncidents(prev => [incident, ...prev]);
      setLastUpdated(new Date().toISOString());
    },
    
    onIncidentUpdated: (incident) => {
      setIncidents(prev => 
        prev.map(i => i.id === incident.id ? incident : i)
      );
      setLastUpdated(new Date().toISOString());
    },
    
    onStandbyDeployed: (deployment) => {
      setStandbyDeployments(prev => [deployment, ...prev]);
      setLastUpdated(new Date().toISOString());
    },
    
    onSystemStatus: (newSnapshot) => {
      setSnapshot(newSnapshot);
      setLastUpdated(new Date().toISOString());
    },
    
    onConnectionChange: (connected) => {
      setIsConnected(connected);
      if (!connected) {
        setError('WebSocket connection lost. Attempting to reconnect...');
      } else {
        setError(null);
      }
    },
    
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    operationsSocket.connect(socketCallbacks);
    
    return () => {
      operationsSocket.disconnect();
    };
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Actions
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  const markBoarded = useCallback(async (departureId: string) => {
    try {
      const response = await operationsApi.markBoarded(departureId);
      if (response.success) {
        setDepartures(prev => 
          prev.map(d => d.id === departureId ? response.data : d)
        );
      } else {
        setError(response.message || 'Failed to mark as boarded');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as boarded');
    }
  }, []);

  const reportIncident = useCallback(async (incident: Omit<Incident, 'id' | 'reportedAt' | 'status'>) => {
    try {
      const response = await operationsApi.createIncident(incident);
      if (response.success) {
        setIncidents(prev => [response.data, ...prev]);
      } else {
        setError(response.message || 'Failed to report incident');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report incident');
    }
  }, []);

  const deployStandby = useCallback(async (
    standbyTrainId: string, 
    replacementForServiceId: string, 
    autoDeploy: boolean = false
  ) => {
    try {
      const response = await operationsApi.deployStandby(standbyTrainId, replacementForServiceId, autoDeploy);
      if (response.success) {
        setStandbyDeployments(prev => [response.data, ...prev]);
      } else {
        setError(response.message || 'Failed to deploy standby');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy standby');
    }
  }, []);

  const updateAutoDeployPolicy = useCallback(async (policy: AutoDeployPolicy) => {
    try {
      const response = await operationsApi.updateAutoDeployPolicy(policy);
      if (response.success) {
        setAutoDeployPolicy(response.data);
      } else {
        setError(response.message || 'Failed to update auto-deploy policy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update auto-deploy policy');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    departures,
    incidents,
    standbyTrains,
    standbyDeployments,
    snapshot,
    autoDeployPolicy,
    isLoading,
    isConnected,
    lastUpdated,
    refreshData,
    markBoarded,
    reportIncident,
    deployStandby,
    updateAutoDeployPolicy,
    error,
    clearError
  };
};
