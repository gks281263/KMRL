import { useState } from 'react';
import { TrainDetails, OverrideRequest } from '@/types/trains';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

interface TrainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  train: TrainDetails | null;
  onAddOverride: (override: OverrideRequest) => Promise<void>;
  onForceMarkAvailable: (trainId: string) => Promise<void>;
  onForceMarkUnavailable: (trainId: string) => Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'eligible': return 'success';
    case 'blocked': return 'warning';
    case 'invalid': return 'danger';
    default: return 'neutral';
  }
};

const getCertificateColor = (status: string) => {
  switch (status) {
    case 'valid': return 'success';
    case 'near_expiry': return 'warning';
    case 'expired': return 'danger';
    case 'missing': return 'neutral';
    default: return 'neutral';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB');
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

export const TrainDrawer = ({
  isOpen,
  onClose,
  train,
  onAddOverride,
  onForceMarkAvailable,
  onForceMarkUnavailable,
}: TrainDrawerProps) => {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    note: '',
    effectiveUntil: '',
  });

  if (!train) return null;

  const handleAddOverride = async () => {
    if (overrideForm.note && overrideForm.effectiveUntil) {
      await onAddOverride({
        trainId: train.trainId,
        note: overrideForm.note,
        effectiveUntil: overrideForm.effectiveUntil,
      });
      setShowOverrideModal(false);
      setOverrideForm({ note: '', effectiveUntil: '' });
    }
  };

  return (
    <>
      {/* Main Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Train {train.trainId}</h2>
              <p className="text-sm text-neutral-600">Detailed Information</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              aria-label="Close drawer"
            >
              ✕
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-900">Status</h3>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  `bg-${getStatusColor(train.status)}-100 text-${getStatusColor(train.status)}-700`
                )}>
                  {train.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-900">{train.jobs.total}</div>
                  <div className="text-sm text-neutral-600">Total Jobs</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-900">{train.mileage.current}</div>
                  <div className="text-sm text-neutral-600">Mileage (km)</div>
                </div>
              </div>
            </div>

            {/* Certificate Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Certificate</h3>
              <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Status:</span>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    `bg-${getCertificateColor(train.certificate.status)}-100 text-${getCertificateColor(train.certificate.status)}-700`
                  )}>
                    {train.certificate.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Expiry:</span>
                  <span className="text-sm font-medium">{formatDate(train.certificate.expiryDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Department:</span>
                  <span className="text-sm font-medium">{train.certificate.department}</span>
                </div>
              </div>
            </div>

            {/* Jobs Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Maintenance Jobs</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-danger-50 rounded-lg">
                  <div className="text-xl font-bold text-danger-600">{train.jobs.critical}</div>
                  <div className="text-xs text-danger-600">Critical</div>
                </div>
                <div className="text-center p-3 bg-warning-50 rounded-lg">
                  <div className="text-xl font-bold text-warning-600">{train.jobs.nonCritical}</div>
                  <div className="text-xs text-warning-600">Non-Critical</div>
                </div>
                <div className="text-center p-3 bg-neutral-50 rounded-lg">
                  <div className="text-xl font-bold text-neutral-900">{train.jobs.total}</div>
                  <div className="text-xs text-neutral-600">Total</div>
                </div>
              </div>
            </div>

            {/* Branding Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Branding</h3>
              <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Progress:</span>
                  <span className="text-sm font-medium">{train.branding.delivered}/{train.branding.target} hours</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${train.branding.percentage}%` }}
                  />
                </div>
                <div className="text-center text-sm text-neutral-600">
                  {train.branding.percentage}% complete
                </div>
              </div>
            </div>

            {/* Cleaning Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Cleaning</h3>
              <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Due:</span>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    train.cleaning.due ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'
                  )}>
                    {train.cleaning.due ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Last Deep Clean:</span>
                  <span className="text-sm font-medium">{formatDate(train.cleaning.lastDeepClean)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Next Scheduled:</span>
                  <span className="text-sm font-medium">{formatDate(train.cleaning.nextScheduled)}</span>
                </div>
                {train.cleaning.bay && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Bay:</span>
                    <span className="text-sm font-medium">{train.cleaning.bay}</span>
                  </div>
                )}
              </div>
            </div>

            {/* XAI Factors */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Eligibility Factors</h3>
              <div className="space-y-3">
                {train.xaiFactors.map((factor, index) => (
                  <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">{factor.factor}</span>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        factor.impact === 'positive' ? 'bg-success-100 text-success-700' :
                        factor.impact === 'negative' ? 'bg-danger-100 text-danger-700' :
                        'bg-neutral-100 text-neutral-700'
                      )}>
                        {factor.impact.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">{factor.description}</p>
                    <div className="mt-2 text-xs text-neutral-500">
                      Weight: {(factor.weight * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Evidence */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Source Evidence</h3>
              <div className="space-y-2">
                {Object.entries(train.sources).map(([source, available]) => (
                  <div key={source} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                    <span className="text-sm font-medium capitalize">{source}</span>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs',
                      available ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'
                    )}>
                      {available ? 'Available' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent History */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">Recent History</h3>
              <div className="space-y-2">
                {train.history.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-900">{event.description}</span>
                      <span className="text-xs text-neutral-500">{formatRelativeTime(event.timestamp)}</span>
                    </div>
                    <div className="text-xs text-neutral-600 capitalize">{event.eventType.replace('_', ' ')} • {event.source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-neutral-200 space-y-3">
            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowOverrideModal(true)}
                fullWidth
              >
                Add Override
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onForceMarkAvailable(train.trainId)}
                fullWidth
              >
                Force Available
              </Button>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onForceMarkUnavailable(train.trainId)}
              fullWidth
            >
              Force Unavailable
            </Button>
          </div>
        </div>
      </div>

      {/* Override Modal */}
      <Modal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        title="Add Override"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="override-note" className="block text-sm font-medium text-neutral-700 mb-2">
              Override Note
            </label>
            <textarea
              id="override-note"
              value={overrideForm.note}
              onChange={(e) => setOverrideForm(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Enter reason for override..."
            />
          </div>
          
          <div>
            <label htmlFor="override-until" className="block text-sm font-medium text-neutral-700 mb-2">
              Effective Until
            </label>
            <input
              id="override-until"
              type="datetime-local"
              value={overrideForm.effectiveUntil}
              onChange={(e) => setOverrideForm(prev => ({ ...prev, effectiveUntil: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowOverrideModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddOverride}
              disabled={!overrideForm.note || !overrideForm.effectiveUntil}
            >
              Add Override
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
