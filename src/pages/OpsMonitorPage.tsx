import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IncidentModal } from '@/components/operations/IncidentModal';
import { useOperationsData } from '@/hooks/useOperationsData';
import { ServiceDeparture, Incident, StandbyTrain } from '@/types/operations';
import { t } from '@/utils/i18n';
import { cn } from '@/utils/cn';

// Utility functions
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
};

const formatVariance = (varianceMs: number) => {
  const minutes = Math.floor(varianceMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

const getStatusIcon = (status: ServiceDeparture['status']) => {
  switch (status) {
    case 'scheduled':
      return '🟢';
    case 'boarding':
      return '🟡';
    case 'departed':
      return '✅';
    case 'delayed':
      return '🟠';
    case 'cancelled':
      return '🔴';
    case 'fault':
      return '⚠️';
    default:
      return '⚪';
  }
};

const getStatusColor = (status: ServiceDeparture['status']) => {
  switch (status) {
    case 'scheduled':
      return 'text-success-600';
    case 'boarding':
      return 'text-warning-600';
    case 'departed':
      return 'text-success-600';
    case 'delayed':
      return 'text-warning-600';
    case 'cancelled':
      return 'text-danger-600';
    case 'fault':
      return 'text-danger-600';
    default:
      return 'text-neutral-600';
  }
};

const getSeverityColor = (severity: Incident['severity']) => {
  switch (severity) {
    case 'low':
      return 'text-success-600 bg-success-50';
    case 'medium':
      return 'text-warning-600 bg-warning-50';
    case 'high':
      return 'text-danger-600 bg-danger-50';
    case 'critical':
      return 'text-danger-700 bg-danger-100';
    default:
      return 'text-neutral-600 bg-neutral-50';
  }
};

export const OpsMonitorPage = () => {
  const {
    departures,
    incidents,
    standbyTrains,
    snapshot,
    isLoading,
    isConnected,
    lastUpdated,
    refreshData,
    markBoarded,
    reportIncident,
    deployStandby,
    error,
    clearError
  } = useOperationsData();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<ServiceDeparture | null>(null);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkBoarded = async (departureId: string) => {
    await markBoarded(departureId);
  };

  const handleReportIncident = async (incident: Omit<Incident, 'id' | 'reportedAt' | 'status'>) => {
    await reportIncident(incident);
  };

  const handleDeployStandby = async (standbyTrainId: string, replacementForServiceId: string) => {
    await deployStandby(standbyTrainId, replacementForServiceId, false);
  };

  const availableStandby = standbyTrains.filter(train => train.status === 'available');
  const deployedStandby = standbyTrains.filter(train => train.status === 'deployed');

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              {t('ops.monitor.title')}
            </h1>
            <p className="text-neutral-600 mt-1">
              {t('ops.monitor.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Live Clock */}
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-sm text-neutral-600">IST</div>
                <div className="text-xl font-mono font-bold text-neutral-900">
                  {currentTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Kolkata'
                  })}
                </div>
              </div>
            </Card>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                'w-3 h-3 rounded-full',
                isConnected ? 'bg-success-500' : 'bg-danger-500'
              )} />
              <span className="text-sm text-neutral-600">
                {isConnected ? t('ops.monitor.connected') : t('ops.monitor.disconnected')}
              </span>
            </div>

            {/* Refresh Button */}
            <Button
              variant="secondary"
              onClick={refreshData}
              disabled={isLoading}
            >
              {t('ops.monitor.refresh')}
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="mt-2 text-sm text-neutral-500">
            {t('ops.monitor.lastUpdated')}: {formatTime(lastUpdated)}
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

      {/* System Snapshot */}
      {snapshot && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">{snapshot.totalServices}</div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.totalServices')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">{snapshot.onTimeServices}</div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.onTime')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">{snapshot.delayedServices}</div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.delayed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">{snapshot.cancelledServices}</div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.cancelled')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">{snapshot.activeIncidents}</div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.incidents')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">{snapshot.availableStandby}</div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.availableStandby')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">{snapshot.deployedStandby}</div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.deployedStandby')}</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                snapshot.systemStatus === 'operational' ? 'text-success-600' :
                snapshot.systemStatus === 'degraded' ? 'text-warning-600' : 'text-danger-600'
              )}>
                {snapshot.systemStatus === 'operational' ? '🟢' : 
                 snapshot.systemStatus === 'degraded' ? '🟡' : '🔴'}
              </div>
              <div className="text-sm text-neutral-600">{t('ops.snapshot.systemStatus')}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Departures */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">
                {t('ops.monitor.departures')}
              </h2>
              <div className="text-sm text-neutral-500">
                {departures.length} {t('ops.monitor.services')}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-neutral-600">{t('common.loading')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                        {t('ops.departures.train')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                        {t('ops.departures.planned')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                        {t('ops.departures.actual')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                        {t('ops.departures.variance')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                        {t('ops.departures.status')}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-700">
                        {t('ops.departures.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departures.map((departure) => (
                      <tr key={departure.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-neutral-900">{departure.trainId}</div>
                            <div className="text-sm text-neutral-600">{departure.destination}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-700">
                          {formatTime(departure.plannedDeparture)}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-700">
                          {departure.actualDeparture ? formatTime(departure.actualDeparture) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {departure.variance ? (
                            <span className={departure.variance > 0 ? 'text-warning-600' : 'text-success-600'}>
                              {departure.variance > 0 ? '+' : ''}{formatVariance(departure.variance)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getStatusIcon(departure.status)}</span>
                            <span className={cn('text-sm font-medium', getStatusColor(departure.status))}>
                              {t(`ops.departures.status.${departure.status}`)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {!departure.isBoarded && departure.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleMarkBoarded(departure.id)}
                              >
                                {t('ops.departures.markBoarded')}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedDeparture(departure);
                                setShowIncidentModal(true);
                              }}
                            >
                              {t('ops.departures.reportFault')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Incident Log */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {t('ops.monitor.incidents')}
              </h3>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowIncidentModal(true)}
              >
                {t('ops.incident.report')}
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          getSeverityColor(incident.severity)
                        )}>
                          {t(`ops.incident.severity.${incident.severity}`)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {formatTime(incident.reportedAt)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-neutral-900">
                        {incident.trainId}
                      </div>
                      <div className="text-xs text-neutral-600 truncate">
                        {incident.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {incidents.length === 0 && (
                <div className="text-center py-4 text-neutral-500">
                  {t('ops.monitor.noIncidents')}
                </div>
              )}
            </div>
          </Card>

          {/* Standby Deployment */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              {t('ops.monitor.standbyDeployment')}
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-neutral-600 mb-2">
                  {t('ops.monitor.availableStandby')} ({availableStandby.length})
                </div>
                <div className="space-y-2">
                  {availableStandby.slice(0, 3).map((train) => (
                    <div key={train.id} className="p-2 border border-neutral-200 rounded-lg">
                      <div className="text-sm font-medium text-neutral-900">
                        {train.trainId}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {train.location} • {train.capacity} {t('ops.standby.capacity')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-neutral-600 mb-2">
                  {t('ops.monitor.deployedStandby')} ({deployedStandby.length})
                </div>
                <div className="space-y-2">
                  {deployedStandby.slice(0, 3).map((train) => (
                    <div key={train.id} className="p-2 border border-warning-200 bg-warning-50 rounded-lg">
                      <div className="text-sm font-medium text-neutral-900">
                        {train.trainId}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {train.location} • {t('ops.standby.deployed')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Incident Modal */}
      <IncidentModal
        isOpen={showIncidentModal}
        onClose={() => {
          setShowIncidentModal(false);
          setSelectedDeparture(null);
        }}
        onSubmit={handleReportIncident}
        trainId={selectedDeparture?.trainId}
        serviceId={selectedDeparture?.id}
      />
    </div>
  );
};
