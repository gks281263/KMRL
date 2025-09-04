import { 
  ServiceDeparture, 
  Incident, 
  StandbyTrain, 
  StandbyDeployment, 
  AutoDeployPolicy,
  OperationsSnapshot,
  FaultTemplate 
} from '@/types/operations';
import { ApiResponse } from '@/types/common';

// Mock data generators
const generateServiceDepartures = (): ServiceDeparture[] => {
  const departures: ServiceDeparture[] = [];
  const routes = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const trainIds = ['T001', 'T002', 'T003', 'T004', 'T005', 'T006', 'T007', 'T008'];
  
  for (let i = 0; i < 20; i++) {
    const plannedDeparture = new Date();
    plannedDeparture.setHours(6 + Math.floor(i / 3), (i % 3) * 20, 0, 0);
    
    const actualDeparture = new Date(plannedDeparture);
    actualDeparture.setMinutes(actualDeparture.getMinutes() + Math.floor(Math.random() * 10) - 5);
    
    const variance = Math.floor((actualDeparture.getTime() - plannedDeparture.getTime()) / (1000 * 60));
    
    departures.push({
      id: `dep_${i + 1}`,
      trainId: trainIds[i % trainIds.length],
      routeId: routes[i % routes.length],
      plannedDeparture: plannedDeparture.toISOString(),
      actualDeparture: actualDeparture.toISOString(),
      variance,
      status: i < 5 ? 'scheduled' : i < 10 ? 'delayed' : 'boarding',
      isBoarded: i < 3,
      platform: `P${(i % 4) + 1}`,
      destination: `Station ${i + 1}`,
      hasFault: i >= 15,
      lastUpdated: new Date().toISOString()
    });
  }
  
  return departures.sort((a, b) => new Date(a.plannedDeparture).getTime() - new Date(b.plannedDeparture).getTime());
};

const generateIncidents = (): Incident[] => {
  const incidents: Incident[] = [];
  const faultCodes = ['F001', 'F002', 'F003', 'F004', 'F005'];
  const descriptions = [
    'Door malfunction detected',
    'Brake system warning',
    'Communication system failure',
    'Air conditioning issue',
    'Power supply fluctuation'
  ];
  const trainIds = ['T001', 'T002', 'T003', 'T004', 'T005'];
  
  for (let i = 0; i < 8; i++) {
    const reportedAt = new Date();
    reportedAt.setHours(reportedAt.getHours() - Math.floor(Math.random() * 6));
    
    incidents.push({
      id: `inc_${i + 1}`,
      trainId: trainIds[i % trainIds.length],
      faultCode: faultCodes[i % faultCodes.length],
      description: descriptions[i % descriptions.length],
      type: i < 2 ? 'mechanical' : i < 4 ? 'electrical' : 'operational',
      severity: i < 3 ? 'high' : i < 6 ? 'medium' : 'low',
      status: i < 2 ? 'open' : i < 5 ? 'investigating' : 'resolved',
      reportedAt: reportedAt.toISOString(),
      resolvedAt: i >= 5 ? new Date(reportedAt.getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString() : undefined,
      resolution: i >= 5 ? 'Issue resolved by maintenance team' : undefined,
      resolvedBy: i >= 5 ? 'Maintenance_1' : undefined,
      reportedBy: `Operator_${i + 1}`,
      serviceId: `SVC_${i + 1}`
    });
  }
  
  return incidents;
};

const generateStandbyTrains = (): StandbyTrain[] => {
  const trains: StandbyTrain[] = [];
  const trainIds = ['ST001', 'ST002', 'ST003', 'ST004'];
  
  for (let i = 0; i < 4; i++) {
    trains.push({
      id: `standby_${i + 1}`,
      trainId: trainIds[i],
      status: i < 2 ? 'available' : 'maintenance',
      priority: i === 0 ? 1 : i === 1 ? 2 : 3,
      location: `Yard_Track_${i + 1}`,
      lastMaintenance: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextMaintenance: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 200
    });
  }
  
  return trains;
};

const generateStandbyDeployments = (): StandbyDeployment[] => {
  const deployments: StandbyDeployment[] = [];
  
  for (let i = 0; i < 3; i++) {
    const deployedAt = new Date();
    deployedAt.setHours(deployedAt.getHours() - Math.floor(Math.random() * 4));
    
    deployments.push({
      id: `deploy_${i + 1}`,
      standbyTrainId: `standby_${i + 1}`,
      replacementForServiceId: `dep_${i + 1}`,
      replacementForTrainId: `T${i + 1}`,
      deployedAt: deployedAt.toISOString(),
      status: i < 2 ? 'active' : 'completed',
      deployedBy: i === 0 ? 'system' : 'operator',

      estimatedArrival: new Date(deployedAt.getTime() + 15 * 60 * 1000).toISOString()
    });
  }
  
  return deployments;
};

const generateFaultTemplates = (): FaultTemplate[] => {
  return [
    {
      id: 'F001',
      code: 'F001',

      description: 'Automatic door system failure',
      severity: 'high',
      category: 'mechanical',
      estimatedResolutionTime: 30,

      commonSolutions: [
        'Check door control system',
        'Inspect door sensors',
        'Test manual override',
        'Replace faulty components if needed'
      ]
    },
    {
      id: 'F002',
      code: 'F002',

      description: 'Brake system performance degradation',
      severity: 'high',
      category: 'safety',
      estimatedResolutionTime: 45,

      commonSolutions: [
        'Perform brake system diagnostics',
        'Check brake fluid levels',
        'Inspect brake pads and discs',
        'Test emergency brake system'
      ]
    },
    {
      id: 'F003',
      code: 'F003',

      description: 'Train-to-control communication loss',
      severity: 'medium',
      category: 'electrical',
      estimatedResolutionTime: 20,

      commonSolutions: [
        'Check communication antenna',
        'Test radio systems',
        'Verify control center connectivity',
        'Restart communication modules'
      ]
    },
    {
      id: 'F004',
      code: 'F004',

      description: 'Air conditioning system malfunction',
      severity: 'low',
      category: 'operational',
      estimatedResolutionTime: 15,

      commonSolutions: [
        'Check AC unit status',
        'Inspect filters and vents',
        'Test temperature controls',
        'Refill refrigerant if needed'
      ]
    },
    {
      id: 'F005',
      code: 'F005',

      description: 'Electrical power supply instability',
      severity: 'medium',
      category: 'electrical',
      estimatedResolutionTime: 25,

      commonSolutions: [
        'Check power supply connections',
        'Test voltage levels',
        'Inspect electrical panels',
        'Verify backup power systems'
      ]
    }
  ];
};

const generateOperationsSnapshot = (): OperationsSnapshot => {
  return {
    timestamp: new Date().toISOString(),
    totalServices: 25,

    onTimeServices: 18,
    delayedServices: 2,
    cancelledServices: 0,
    activeIncidents: 3,
    availableStandby: 2,
    deployedStandby: 1,
    systemStatus: 'operational'
  };
};

const generateAutoDeployPolicy = (): AutoDeployPolicy => {
  return {

    enabled: true,

    thresholdMinutes: 10,
    maxStandbyUsage: 3,
    requireConfirmation: false,
    notifyStakeholders: true,

  };
};

// Mock API functions
export const mockOperationsApi = {
  async getServiceDepartures(): Promise<ApiResponse<ServiceDeparture[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateServiceDepartures(),
      message: 'Service departures loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async updateDepartureStatus(
    departureId: string, 
    status: ServiceDeparture['status'], 
    actualDeparture?: string
  ): Promise<ApiResponse<ServiceDeparture>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock update - in real app, this would update the actual departure
    const mockDeparture: ServiceDeparture = {
      id: departureId,
      trainId: 'T001',
      routeId: 'A1',
      plannedDeparture: new Date().toISOString(),
      actualDeparture: actualDeparture || new Date().toISOString(),
      variance: 0,
      status,
      isBoarded: status === 'boarding',
      platform: 'P1',
      destination: 'Station 1',
      hasFault: false,
      lastUpdated: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockDeparture,
      message: 'Departure status updated successfully',
      timestamp: new Date().toISOString()
    };
  },

  async markBoarded(departureId: string): Promise<ApiResponse<ServiceDeparture>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockDeparture: ServiceDeparture = {
      id: departureId,
      trainId: 'T001',
      routeId: 'A1',
      plannedDeparture: new Date().toISOString(),
      actualDeparture: new Date().toISOString(),
      variance: 0,
      status: 'boarding',
      isBoarded: true,
      platform: 'P1',
      destination: 'Station 1',
      hasFault: false,
      lastUpdated: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockDeparture,
      message: 'Train marked as boarding',
      timestamp: new Date().toISOString()
    };
  },

  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      data: generateIncidents(),
      message: 'Incidents loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async createIncident(incident: Omit<Incident, 'id' | 'reportedAt' | 'status'>): Promise<ApiResponse<Incident>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newIncident: Incident = {
      ...incident,
      id: `inc_${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'open'
    };
    
    return {
      success: true,
      data: newIncident,
      message: 'Incident created successfully',
      timestamp: new Date().toISOString()
    };
  },

  async updateIncident(
    incidentId: string, 
    updates: Partial<Incident>
  ): Promise<ApiResponse<Incident>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock update - in real app, this would update the actual incident
    const mockIncident: Incident = {
      id: incidentId,
      trainId: 'T001',
      faultCode: 'F001',
      description: 'Door malfunction detected',
      type: 'mechanical',
      severity: 'high',
      status: 'investigating',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      reportedBy: 'Operator_1',
      serviceId: 'SVC_1',
      ...updates
    };
    
    return {
      success: true,
      data: mockIncident,
      message: 'Incident updated successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getFaultTemplates(): Promise<ApiResponse<FaultTemplate[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateFaultTemplates(),
      message: 'Fault templates loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getStandbyTrains(): Promise<ApiResponse<StandbyTrain[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateStandbyTrains(),
      message: 'Standby trains loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async deployStandby(
    standbyTrainId: string, 
    replacementForServiceId: string,
    autoDeploy: boolean = false
  ): Promise<ApiResponse<StandbyDeployment>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const deployment: StandbyDeployment = {
      id: `deploy_${Date.now()}`,
      standbyTrainId,
      replacementForServiceId,
      replacementForTrainId: 'T001',
      deployedAt: new Date().toISOString(),
      status: 'active',
      deployedBy: autoDeploy ? 'system' : 'operator',

      estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
    
    return {
      success: true,
      data: deployment,
      message: 'Standby train deployed successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getStandbyDeployments(): Promise<ApiResponse<StandbyDeployment[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateStandbyDeployments(),
      message: 'Standby deployments loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getAutoDeployPolicy(): Promise<ApiResponse<AutoDeployPolicy>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateAutoDeployPolicy(),
      message: 'Auto deploy policy loaded successfully',
      timestamp: new Date().toISOString()
    };
  },

  async updateAutoDeployPolicy(policy: AutoDeployPolicy): Promise<ApiResponse<AutoDeployPolicy>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const updatedPolicy = {
      ...policy,
      lastUpdated: new Date().toISOString()
    };
    
    return {
      success: true,
      data: updatedPolicy,
      message: 'Auto deploy policy updated successfully',
      timestamp: new Date().toISOString()
    };
  },

  async getOperationsSnapshot(): Promise<ApiResponse<OperationsSnapshot>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      data: generateOperationsSnapshot(),
      message: 'Operations snapshot loaded successfully',
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
      message: 'Operations service is healthy',
      timestamp: new Date().toISOString()
    };
  }
};
