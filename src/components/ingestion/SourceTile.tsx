import { useState } from 'react';
import { SourceData, SourceId } from '@/types/ingestion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

interface SourceTileProps {
  source: SourceData;
  onSync: (sourceId: SourceId) => void;
  onUpload?: (sourceId: SourceId) => void;
  isSyncing: boolean;
}

const getStalenessBadge = (lastSync: string) => {
  const now = new Date();
  const syncTime = new Date(lastSync);
  const diffMinutes = Math.floor((now.getTime() - syncTime.getTime()) / (1000 * 60));

  if (diffMinutes < 15) {
    return { color: 'success', label: 'Fresh', icon: '✓' };
  } else if (diffMinutes < 60) {
    return { color: 'warning', label: 'Stale', icon: '⚠' };
  } else {
    return { color: 'danger', label: 'Outdated', icon: '✗' };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ok': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    case 'syncing': return 'primary';
    default: return 'neutral';
  }
};

const getSourceIcon = (sourceId: SourceId) => {
  const icons = {
    maximo: '🔧',
    cert: '📋',
    branding: '🎨',
    iot: '📡',
    cleaning: '🧹',
    yard: '🚉',
    overrides: '⚙️',
  };
  return icons[sourceId] || '📊';
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

export const SourceTile = ({ source, onSync, onUpload, isSyncing }: SourceTileProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const staleness = getStalenessBadge(source.last_sync);
  const statusColor = getStatusColor(source.status);
  const sourceIcon = getSourceIcon(source.id);

  return (
    <>
      <div onClick={() => setShowDetails(true)}>
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{sourceIcon}</span>
            <div>
              <h3 className="font-semibold text-lg text-neutral-900">{source.name}</h3>
              <p className="text-sm text-neutral-600">{formatRelativeTime(source.last_sync)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              `bg-${staleness.color}-100 text-${staleness.color}-700`
            )}>
              {staleness.icon} {staleness.label}
            </span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              `bg-${statusColor}-100 text-${statusColor}-700`
            )}>
              {source.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {source.open_count !== undefined && (
              <div>
                <span className="text-neutral-600">Open:</span>
                <span className={cn(
                  'ml-1 font-medium',
                  source.open_count > 20 ? 'text-warning-600' : 'text-success-600'
                )}>
                  {source.open_count}
                </span>
              </div>
            )}
            {source.error_count !== undefined && (
              <div>
                <span className="text-neutral-600">Errors:</span>
                <span className={cn(
                  'ml-1 font-medium',
                  source.error_count > 0 ? 'text-danger-600' : 'text-success-600'
                )}>
                  {source.error_count}
                </span>
              </div>
            )}
            {source.total_records !== undefined && (
              <div>
                <span className="text-neutral-600">Records:</span>
                <span className="ml-1 font-medium text-neutral-900">{source.total_records}</span>
              </div>
            )}
            {source.sync_duration !== undefined && (
              <div>
                <span className="text-neutral-600">Duration:</span>
                <span className="ml-1 font-medium text-neutral-900">{source.sync_duration}s</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onSync(source.id);
              }}
              loading={isSyncing}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
            {onUpload && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  onUpload(source.id);
                }}
                disabled={isSyncing}
              >
                Upload
              </Button>
            )}
          </div>
        </div>
        </Card>
        </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={`${source.name} Details`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900">{source.total_records || 0}</div>
              <div className="text-sm text-neutral-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">{source.open_count || 0}</div>
              <div className="text-sm text-neutral-600">Open Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">{source.error_count || 0}</div>
              <div className="text-sm text-neutral-600">Errors</div>
            </div>
          </div>

          {/* Last Sync Details */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">Last Sync</h4>
            <div className="text-sm text-neutral-600">
              <div>Time: {new Date(source.last_sync).toLocaleString()}</div>
              <div>Duration: {source.sync_duration || 'N/A'} seconds</div>
              {source.last_error && (
                <div className="text-danger-600 mt-1">
                  Last Error: {source.last_error}
                </div>
              )}
            </div>
          </div>

          {/* Sample Data */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">Sample Data</h4>
            <div className="bg-neutral-50 p-3 rounded text-sm font-mono">
              <div>Sample row preview...</div>
              <div className="text-neutral-500">Click to view full data</div>
            </div>
          </div>

          {/* Invalid Trains (if any) */}
          {source.trains_invalid && source.trains_invalid.length > 0 && (
            <div>
              <h4 className="font-medium text-warning-600 mb-2">Invalid Trains</h4>
              <div className="flex flex-wrap gap-2">
                {source.trains_invalid.map((trainId) => (
                  <span key={trainId} className="px-2 py-1 bg-warning-100 text-warning-700 rounded text-sm">
                    Train {trainId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <Button
              variant="primary"
              onClick={() => {
                onSync(source.id);
                setShowDetails(false);
              }}
              loading={isSyncing}
              disabled={isSyncing}
            >
              Force Sync
            </Button>
            {onUpload && (
              <Button
                variant="secondary"
                onClick={() => {
                  onUpload(source.id);
                  setShowDetails(false);
                }}
                disabled={isSyncing}
              >
                Upload File
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowDetails(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
