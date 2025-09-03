import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KpiCard } from '@/components/analytics/KpiCard';
import { LineChart } from '@/components/analytics/LineChart';
import { StackedBarChart } from '@/components/analytics/StackedBarChart';
import { Heatmap } from '@/components/analytics/Heatmap';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { MlDatasetStatus } from '@/types/analytics';
import { t } from '@/utils/i18n';
import { cn } from '@/utils/cn';

export const AnalyticsPage = () => {
  const {
    summary,
    mlDatasets,
    mileageData,
    brandingData,
    shuntingData,
    isLoading,
    isChartLoading,
    isExporting,
    lastUpdated,
    dateRange,
    refreshData,
    updateDateRange,
    exportMlDataset,
    triggerMlRetrain,
    error,
    clearError
  } = useAnalyticsData();

  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'parquet'>('csv');

  const handleDateRangeChange = async (start: string, end: string) => {
    await updateDateRange(start, end, dateRange.compareToPrevious);
  };

  const handleCompareToggle = async () => {
    await updateDateRange(dateRange.start, dateRange.end, !dateRange.compareToPrevious);
  };

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId) 
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const handleExport = async () => {
    if (selectedDatasets.length === 0) {
      alert('Please select at least one dataset to export');
      return;
    }

    try {
      const response = await exportMlDataset({
        datasetIds: selectedDatasets,
        format: exportFormat,
        includeMetadata: true,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        }
      });

      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleRetrain = async () => {
    if (selectedDatasets.length === 0) {
      alert('Please select at least one dataset to retrain');
      return;
    }

    try {
      const response = await triggerMlRetrain(selectedDatasets);
      alert(`Retrain job started: ${response.jobId}`);
    } catch (err) {
      console.error('Retrain failed:', err);
    }
  };

  const getStatusColor = (status: MlDatasetStatus['status']) => {
    switch (status) {
      case 'ready':
        return 'text-success-600 bg-success-50';
      case 'missing_fields':
        return 'text-warning-600 bg-warning-50';
      case 'stale':
        return 'text-danger-600 bg-danger-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getStatusIcon = (status: MlDatasetStatus['status']) => {
    switch (status) {
      case 'ready':
        return '✅';
      case 'missing_fields':
        return '⚠️';
      case 'stale':
        return '🔄';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              {t('analytics.title')}
            </h1>
            <p className="text-neutral-600 mt-1">
              {t('analytics.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange(e.target.value, dateRange.end)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-neutral-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange(dateRange.start, e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Compare Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dateRange.compareToPrevious}
                onChange={handleCompareToggle}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-600">
                {t('analytics.dateRange.compareToPrevious')}
              </span>
            </label>

            {/* Refresh Button */}
            <Button
              variant="secondary"
              onClick={refreshData}
              disabled={isLoading}
            >
              {t('analytics.actions.refresh')}
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-2 text-sm text-neutral-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="mb-6 p-4 bg-danger-50 border-danger-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-danger-600">⚠️</span>
              <span className="text-danger-700">{error}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearError}
            >
              {t('common.dismiss')}
            </Button>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {summary.kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="space-y-8">
        {/* Mileage Variance Chart */}
        <LineChart
          data={mileageData}
          title={t('analytics.charts.mileageVariance')}
          isLoading={isChartLoading}
        />

        {/* Branding Compliance Chart */}
        <StackedBarChart
          data={brandingData}
          title={t('analytics.charts.brandingCompliance')}
          isLoading={isChartLoading}
        />

        {/* Shunting Heatmap */}
        <Heatmap
          data={shuntingData}
          title={t('analytics.charts.shuntingHeatmap')}
          isLoading={isChartLoading}
        />
      </div>

      {/* ML Datasets Section */}
      <div className="mt-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {t('analytics.ml.datasets')}
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* Export Format Selector */}
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="csv">{t('analytics.ml.exportFormat.csv')}</option>
                <option value="json">{t('analytics.ml.exportFormat.json')}</option>
                <option value="parquet">{t('analytics.ml.exportFormat.parquet')}</option>
              </select>

              {/* Export Button */}
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={isExporting || selectedDatasets.length === 0}
                loading={isExporting}
              >
                {t('analytics.ml.export')}
              </Button>

              {/* Retrain Button */}
              <Button
                variant="warning"
                onClick={handleRetrain}
                disabled={selectedDatasets.length === 0}
              >
                {t('analytics.ml.retrain')}
              </Button>
            </div>
          </div>

          {/* ML Datasets Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={selectedDatasets.length === mlDatasets.length && mlDatasets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDatasets(mlDatasets.map(d => d.id));
                        } else {
                          setSelectedDatasets([]);
                        }
                      }}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                    Dataset
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                    Records
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                    Completeness
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {mlDatasets.map((dataset) => (
                  <tr key={dataset.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedDatasets.includes(dataset.id)}
                        onChange={() => handleDatasetSelect(dataset.id)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900">{dataset.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(dataset.status)}</span>
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          getStatusColor(dataset.status)
                        )}>
                                                     {t(`analytics.ml.status.${dataset.status === 'missing_fields' ? 'missingFields' : dataset.status}`)}
                        </span>
                      </div>
                      {dataset.status === 'missing_fields' && dataset.missingFields && (
                        <div className="text-xs text-neutral-500 mt-1">
                          Missing: {dataset.missingFields.join(', ')}
                        </div>
                      )}
                      {dataset.status === 'stale' && dataset.stalenessDays && (
                        <div className="text-xs text-neutral-500 mt-1">
                          {dataset.stalenessDays} days old
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">
                      {dataset.recordCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">
                      {dataset.completeness.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-700">
                      {new Date(dataset.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mlDatasets.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              {t('analytics.noData')}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
