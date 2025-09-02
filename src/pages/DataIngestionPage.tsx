import { useState, useEffect } from 'react';
import { SourceId, IngestionStatus, SyncJob, IngestionEvent } from '@/types/ingestion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SourceTile } from '@/components/ingestion/SourceTile';
import { UploadModal } from '@/components/ingestion/UploadModal';
import { cn } from '@/utils/cn';

// Mock data for MVP
const mockIngestionStatus: IngestionStatus = {
  snapshot_time: new Date().toISOString(),
  freshness_percentage: 85,
  last_full_snapshot: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  total_sources: 7,
  sources_ok: 4,
  sources_warning: 2,
  sources_error: 1,
  sources: [
    {
      id: 'maximo',
      name: 'Maximo Job Cards',
      last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      status: 'ok',
      open_count: 12,
      error_count: 0,
      total_records: 145,
      sync_duration: 45,
    },
    {
      id: 'cert',
      name: 'Fitness Certificates',
      last_sync: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      status: 'warning',
      trains_invalid: [101, 115],
      total_records: 89,
      sync_duration: 23,
    },
    {
      id: 'branding',
      name: 'Branding Contracts',
      last_sync: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      status: 'ok',
      total_records: 67,
      sync_duration: 12,
    },
    {
      id: 'iot',
      name: 'IoT and Mileage',
      last_sync: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      status: 'ok',
      total_records: 234,
      sync_duration: 67,
    },
    {
      id: 'cleaning',
      name: 'Cleaning Roster',
      last_sync: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 minutes ago
      status: 'error',
      last_error: 'Connection timeout',
      total_records: 45,
      sync_duration: 0,
    },
    {
      id: 'yard',
      name: 'Yard Layout',
      last_sync: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
      status: 'warning',
      total_records: 23,
      sync_duration: 8,
    },
    {
      id: 'overrides',
      name: 'Manual Overrides',
      last_sync: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      status: 'ok',
      total_records: 12,
      sync_duration: 3,
    },
  ],
};

const mockEvents: IngestionEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    source: 'iot',
    event_type: 'sync_completed',
    message: 'IoT sync completed successfully - 234 records processed',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    source: 'maximo',
    event_type: 'sync_completed',
    message: 'Maximo sync completed - 12 open tasks found',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    source: 'branding',
    event_type: 'sync_completed',
    message: 'Branding contracts updated - 67 active contracts',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    source: 'overrides',
    event_type: 'override_added',
    message: 'Manual override added for Train 101 - Certificate extension',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    source: 'yard',
    event_type: 'sync_completed',
    message: 'Yard layout sync completed - 23 tracks mapped',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    source: 'cert',
    event_type: 'sync_completed',
    message: 'Certificate sync completed - 2 invalid certificates found',
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    source: 'cleaning',
    event_type: 'sync_failed',
    message: 'Cleaning roster sync failed - Connection timeout',
  },
];

export const DataIngestionPage = () => {
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus>(mockIngestionStatus);
  const [events, setEvents] = useState<IngestionEvent[]>(mockEvents);
  const [syncingSources, setSyncingSources] = useState<Set<SourceId>>(new Set());
  const [showForceSyncModal, setShowForceSyncModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSource, setUploadSource] = useState<SourceId | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch fresh data
      console.log('Refreshing ingestion status...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = async (sourceId: SourceId) => {
    setSyncingSources(prev => new Set(prev).add(sourceId));
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Update the source status
    setIngestionStatus(prev => ({
      ...prev,
      sources: prev.sources.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              last_sync: new Date().toISOString(),
              status: 'ok' as const,
              sync_duration: Math.floor(Math.random() * 60) + 10
            }
          : source
      )
    }));

    // Add event
    const newEvent: IngestionEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      source: sourceId,
      event_type: 'sync_completed',
      message: `${sourceId} sync completed successfully`,
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events

    setSyncingSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(sourceId);
      return newSet;
    });
  };

  const handleForceSyncAll = async () => {
    setShowForceSyncModal(false);
    
    // Add all sources to syncing state
    const allSources = ingestionStatus.sources.map(s => s.id);
    setSyncingSources(new Set(allSources));
    
    // Simulate sync process for all sources
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update all sources
    setIngestionStatus(prev => ({
      ...prev,
      snapshot_time: new Date().toISOString(),
      freshness_percentage: 100,
      sources: prev.sources.map(source => ({
        ...source,
        last_sync: new Date().toISOString(),
        status: 'ok' as const,
        sync_duration: Math.floor(Math.random() * 60) + 10
      }))
    }));

    // Add event
    const newEvent: IngestionEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      source: 'maximo', // Use first source for "all" sync
      event_type: 'sync_completed',
      message: 'Full system sync completed successfully',
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]);

    setSyncingSources(new Set());
  };

  const handleUpload = async (sourceId: SourceId) => {
    setUploadSource(sourceId);
    setShowUploadModal(true);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add upload event
    const newEvent: IngestionEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      source: uploadSource!,
      event_type: 'upload_success',
      message: `File uploaded successfully: ${file.name}`,
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    
    setIsUploading(false);
    setShowUploadModal(false);
    setUploadSource(null);
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sync_completed': return '✅';
      case 'sync_failed': return '❌';
      case 'sync_started': return '🔄';
      case 'upload_success': return '📤';
      case 'upload_failed': return '📤❌';
      case 'override_added': return '⚙️';
      case 'override_expired': return '⏰';
      default: return '📝';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'sync_completed':
      case 'upload_success':
      case 'override_added':
        return 'text-success-600';
      case 'sync_failed':
      case 'upload_failed':
        return 'text-danger-600';
      case 'sync_started':
        return 'text-primary-600';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Data Ingestion Dashboard</h1>
            <p className="text-neutral-600 mt-1">Monitor and manage data sources for train induction system</p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowForceSyncModal(true)}
            disabled={syncingSources.size > 0}
          >
            Force Sync All
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Ingestion Summary</h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{ingestionStatus.freshness_percentage}%</div>
                  <div className="text-sm text-neutral-600">Freshness</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-semibold text-success-600">{ingestionStatus.sources_ok}</div>
                    <div className="text-xs text-neutral-600">OK</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-warning-600">{ingestionStatus.sources_warning}</div>
                    <div className="text-xs text-neutral-600">Warning</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-danger-600">{ingestionStatus.sources_error}</div>
                    <div className="text-xs text-neutral-600">Error</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-neutral-200">
                  <div className="text-sm text-neutral-600 mb-2">Last Full Snapshot</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {formatRelativeTime(ingestionStatus.last_full_snapshot)}
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    // Trigger pre-validation
                    const newEvent: IngestionEvent = {
                      id: Date.now().toString(),
                      timestamp: new Date().toISOString(),
                      source: 'maximo',
                      event_type: 'sync_started',
                      message: 'Pre-validation started',
                    };
                    setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
                  }}
                >
                  Run Pre-Validation
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Source Tiles */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {ingestionStatus.sources.map((source) => (
                <SourceTile
                  key={source.id}
                  source={source}
                  onSync={handleSync}
                  onUpload={['cert', 'branding', 'cleaning', 'yard'].includes(source.id) ? handleUpload : undefined}
                  isSyncing={syncingSources.has(source.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Recent Events</h2>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="text-lg">{getEventIcon(event.event_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-sm font-medium', getEventColor(event.event_type))}>
                      {event.message}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {formatRelativeTime(event.timestamp)} • {event.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Force Sync All Modal */}
      <Modal
        isOpen={showForceSyncModal}
        onClose={() => setShowForceSyncModal(false)}
        title="Force Sync All Sources"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            This will trigger a full sync of all data sources. This process may take several minutes and will temporarily impact system performance.
          </p>
          <p className="text-sm text-neutral-500">
            Estimated duration: 3-5 minutes
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowForceSyncModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleForceSyncAll}
            >
              Force Sync All
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      {uploadSource && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadSource(null);
          }}
          sourceId={uploadSource}
          onUpload={handleFileUpload}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};
