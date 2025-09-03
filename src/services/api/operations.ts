import { ApiResponse } from '@/types/common';
import { 
  ServiceDeparture, 
  Incident, 
  StandbyTrain, 
  StandbyDeployment, 
  AutoDeployPolicy,
  OperationsSnapshot,
  FaultTemplate 
} from '@/types/operations';

const API_BASE = '/api/ops';

export const operationsApi = {
  // Service Departures
  async getServiceDepartures(): Promise<ApiResponse<ServiceDeparture[]>> {
    const response = await fetch(`${API_BASE}/departures/`);
    return response.json();
  },

  async updateDepartureStatus(
    departureId: string, 
    status: ServiceDeparture['status'], 
    actualDeparture?: string
  ): Promise<ApiResponse<ServiceDeparture>> {
    const response = await fetch(`${API_BASE}/departures/${departureId}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actualDeparture }),
    });
    return response.json();
  },

  async markBoarded(departureId: string): Promise<ApiResponse<ServiceDeparture>> {
    const response = await fetch(`${API_BASE}/departures/${departureId}/board/`, {
      method: 'POST',
    });
    return response.json();
  },

  // Incidents
  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    const response = await fetch(`${API_BASE}/incidents/`);
    return response.json();
  },

  async createIncident(incident: Omit<Incident, 'id' | 'reportedAt' | 'status'>): Promise<ApiResponse<Incident>> {
    const response = await fetch(`${API_BASE}/incidents/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
    });
    return response.json();
  },

  async updateIncident(
    incidentId: string, 
    updates: Partial<Incident>
  ): Promise<ApiResponse<Incident>> {
    const response = await fetch(`${API_BASE}/incidents/${incidentId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async getFaultTemplates(): Promise<ApiResponse<FaultTemplate[]>> {
    const response = await fetch(`${API_BASE}/fault-templates/`);
    return response.json();
  },

  // Standby Trains
  async getStandbyTrains(): Promise<ApiResponse<StandbyTrain[]>> {
    const response = await fetch(`${API_BASE}/standby/`);
    return response.json();
  },

  async deployStandby(
    standbyTrainId: string, 
    replacementForServiceId: string,
    autoDeploy: boolean = false
  ): Promise<ApiResponse<StandbyDeployment>> {
    const response = await fetch(`${API_BASE}/standby/deploy/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        standbyTrainId, 
        replacementForServiceId,
        autoDeploy 
      }),
    });
    return response.json();
  },

  async getStandbyDeployments(): Promise<ApiResponse<StandbyDeployment[]>> {
    const response = await fetch(`${API_BASE}/standby/deployments/`);
    return response.json();
  },

  // Auto Deploy Policy
  async getAutoDeployPolicy(): Promise<ApiResponse<AutoDeployPolicy>> {
    const response = await fetch(`${API_BASE}/auto-deploy-policy/`);
    return response.json();
  },

  async updateAutoDeployPolicy(policy: AutoDeployPolicy): Promise<ApiResponse<AutoDeployPolicy>> {
    const response = await fetch(`${API_BASE}/auto-deploy-policy/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    return response.json();
  },

  // System Status
  async getOperationsSnapshot(): Promise<ApiResponse<OperationsSnapshot>> {
    const response = await fetch(`${API_BASE}/snapshot/`);
    return response.json();
  },

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    const response = await fetch(`${API_BASE}/health/`);
    return response.json();
  },
};

// Example Django endpoints (for reference):
/*
# Django URLs (urls.py)
urlpatterns = [
    path('api/ops/departures/', views.ServiceDepartureViewSet.as_view({'get': 'list'})),
    path('api/ops/departures/<str:pk>/status/', views.ServiceDepartureViewSet.as_view({'patch': 'update_status'})),
    path('api/ops/departures/<str:pk>/board/', views.ServiceDepartureViewSet.as_view({'post': 'mark_boarded'})),
    path('api/ops/incidents/', views.IncidentViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('api/ops/incidents/<str:pk>/', views.IncidentViewSet.as_view({'patch': 'partial_update'})),
    path('api/ops/fault-templates/', views.FaultTemplateViewSet.as_view({'get': 'list'})),
    path('api/ops/standby/', views.StandbyTrainViewSet.as_view({'get': 'list'})),
    path('api/ops/standby/deploy/', views.StandbyDeploymentViewSet.as_view({'post': 'create'})),
    path('api/ops/standby/deployments/', views.StandbyDeploymentViewSet.as_view({'get': 'list'})),
    path('api/ops/auto-deploy-policy/', views.AutoDeployPolicyViewSet.as_view({'get': 'retrieve', 'put': 'update'})),
    path('api/ops/snapshot/', views.OperationsSnapshotViewSet.as_view({'get': 'retrieve'})),
    path('api/ops/health/', views.HealthCheckView.as_view()),
    path('api/ops/stream/', views.OperationsWebSocketView.as_view()),
]

# Example Django View (views.py)
class ServiceDepartureViewSet(viewsets.ModelViewSet):
    queryset = ServiceDeparture.objects.all()
    serializer_class = ServiceDepartureSerializer
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        departure = self.get_object()
        status = request.data.get('status')
        actual_departure = request.data.get('actualDeparture')
        
        departure.status = status
        if actual_departure:
            departure.actual_departure = actual_departure
            departure.variance = self.calculate_variance(departure)
        
        departure.save()
        
        # Broadcast via WebSocket
        self.broadcast_departure_update(departure)
        
        return Response(ServiceDepartureSerializer(departure).data)
    
    @action(detail=True, methods=['post'])
    def mark_boarded(self, request, pk=None):
        departure = self.get_object()
        departure.is_boarding = True
        departure.status = 'boarding'
        departure.save()
        
        # Broadcast via WebSocket
        self.broadcast_departure_update(departure)
        
        return Response(ServiceDepartureSerializer(departure).data)
*/
