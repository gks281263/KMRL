import { ApiResponse } from '@/types/common';
import { 
  AnalyticsSummary, 
  MlDatasetStatus,
  MlExportRequest, 
  MlExportResponse,
  MileageVarianceData,
  BrandingComplianceData,
  ShuntingHeatmapData
} from '@/types/analytics';

const API_BASE = '/api/analytics';

export const analyticsApi = {
  // Analytics Summary
  async getAnalyticsSummary(
    startDate?: string, 
    endDate?: string, 
    compareToPrevious: boolean = false
  ): Promise<ApiResponse<AnalyticsSummary>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (compareToPrevious) params.append('compare_to_previous', 'true');
    
    const response = await fetch(`${API_BASE}/summary/?${params.toString()}`);
    return response.json();
  },

  // ML Datasets
  async getMlDatasetsStatus(): Promise<ApiResponse<MlDatasetStatus[]>> {
    const response = await fetch(`${API_BASE}/ml/datasets/status/`);
    return response.json();
  },

  async exportMlDataset(request: MlExportRequest): Promise<ApiResponse<MlExportResponse>> {
    const response = await fetch(`${API_BASE}/ml/export/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  },

  async getMlExportStatus(exportId: string): Promise<ApiResponse<MlExportResponse>> {
    const response = await fetch(`${API_BASE}/ml/export/${exportId}/status/`);
    return response.json();
  },

  async triggerMlRetrain(datasetIds: string[]): Promise<ApiResponse<{ jobId: string; status: string }>> {
    const response = await fetch(`${API_BASE}/ml/retrain/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetIds }),
    });
    return response.json();
  },

  // Chart Data Endpoints
  async getMileageVarianceData(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<MileageVarianceData[]>> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    
    const response = await fetch(`${API_BASE}/charts/mileage-variance/?${params.toString()}`);
    return response.json();
  },

  async getBrandingComplianceData(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<BrandingComplianceData[]>> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    
    const response = await fetch(`${API_BASE}/charts/branding-compliance/?${params.toString()}`);
    return response.json();
  },

  async getShuntingHeatmapData(
    startDate: string, 
    endDate: string
  ): Promise<ApiResponse<ShuntingHeatmapData[]>> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    
    const response = await fetch(`${API_BASE}/charts/shunting-heatmap/?${params.toString()}`);
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
    path('api/analytics/summary/', views.AnalyticsSummaryView.as_view()),
    path('api/analytics/ml/datasets/status/', views.MlDatasetsStatusView.as_view()),
    path('api/analytics/ml/export/', views.MlExportView.as_view()),
    path('api/analytics/ml/export/<str:export_id>/status/', views.MlExportStatusView.as_view()),
    path('api/analytics/ml/retrain/', views.MlRetrainView.as_view()),
    path('api/analytics/charts/mileage-variance/', views.MileageVarianceChartView.as_view()),
    path('api/analytics/charts/branding-compliance/', views.BrandingComplianceChartView.as_view()),
    path('api/analytics/charts/shunting-heatmap/', views.ShuntingHeatmapChartView.as_view()),
    path('api/analytics/health/', views.AnalyticsHealthView.as_view()),
]

# Example Django View (views.py)
class AnalyticsSummaryView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        compare_to_previous = request.query_params.get('compare_to_previous', 'false').lower() == 'true'
        
        # Calculate KPIs
        kpis = self.calculate_kpis(start_date, end_date, compare_to_previous)
        
        # Get chart data
        charts = self.get_chart_data(start_date, end_date)
        
        # Get ML dataset status
        ml_datasets = self.get_ml_datasets_status()
        
        return Response({
            'success': True,
            'data': {
                'kpis': kpis,
                'charts': charts,
                'mlDatasets': ml_datasets,
                'dateRange': {
                    'start': start_date,
                    'end': end_date,
                    'compareToPrevious': compare_to_previous
                },
                'lastUpdated': datetime.now().isoformat()
            },
            'timestamp': datetime.now().isoformat()
        })
    
    def calculate_kpis(self, start_date, end_date, compare_to_previous):
        # Calculate punctuality, mileage variance, branding compliance, etc.
        return [
            {
                'id': 'punctuality',
                'name': 'Punctuality',
                'value': 94.2,
                'unit': '%',
                'delta': 2.1,
                'trend': 'up',
                'sparkline': [92.1, 93.5, 94.2, 93.8, 94.5, 94.2, 94.8],
                'lastUpdated': datetime.now().isoformat()
            },
            # ... more KPIs
        ]
*/
