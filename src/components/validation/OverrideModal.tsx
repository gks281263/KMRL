import { useState } from 'react';
import { OverrideRequest, ValidationRule } from '@/types/validation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainId: string;
  rule: ValidationRule;
  onOverride: (override: OverrideRequest) => Promise<void>;
  isLoading?: boolean;
}

const getRuleIcon = (ruleId: string) => {
  switch (ruleId) {
    case 'certificate_validity': return '📋';
    case 'critical_jobcards_closed': return '🔧';
    case 'cleaning_schedule': return '🧹';
    case 'yard_capacity': return '🚉';
    case 'minimum_service_targets': return '🚆';
    case 'stabling_geometry': return '📐';
    default: return '⚠️';
  }
};

const getRuleColor = (ruleId: string) => {
  switch (ruleId) {
    case 'certificate_validity': return 'danger';
    case 'critical_jobcards_closed': return 'danger';
    case 'cleaning_schedule': return 'warning';
    case 'yard_capacity': return 'warning';
    case 'minimum_service_targets': return 'primary';
    case 'stabling_geometry': return 'primary';
    default: return 'neutral';
  }
};

export const OverrideModal = ({
  isOpen,
  onClose,
  trainId,
  rule,
  onOverride,
  isLoading = false,
}: OverrideModalProps) => {
  const [formData, setFormData] = useState({
    reason: '',
    expiresAt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    if (!formData.expiresAt) {
      newErrors.expiresAt = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiresAt);
      const now = new Date();
      if (expiryDate <= now) {
        newErrors.expiresAt = 'Expiry date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const override: OverrideRequest = {
      trainId,
      rule: rule.id,
      reason: formData.reason.trim(),
      expiresAt: formData.expiresAt,
    };

    try {
      await onOverride(override);
      // Reset form on success
      setFormData({ reason: '', expiresAt: '' });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Override failed:', error);
    }
  };

  const handleClose = () => {
    setFormData({ reason: '', expiresAt: '' });
    setErrors({});
    onClose();
  };

  const getMinExpiryDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const getMaxExpiryDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7); // Maximum 7 days from now
    return maxDate.toISOString().slice(0, 16);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Supervisor Override"
      size="md"
    >
      <div className="space-y-6">
        {/* Rule Information */}
        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getRuleIcon(rule.id)}</span>
            <div>
              <h4 className="font-medium text-neutral-900">{rule.name}</h4>
              <p className="text-sm text-neutral-600">{rule.description}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              `bg-${getRuleColor(rule.id)}-100 text-${getRuleColor(rule.id)}-700`
            )}>
              {rule.severity}
            </span>
            <span className="text-sm text-neutral-600">Train {trainId}</span>
          </div>
        </div>

        {/* Override Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="override-reason" className="block text-sm font-medium text-neutral-700 mb-2">
              Override Reason *
            </label>
            <textarea
              id="override-reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                errors.reason ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300'
              )}
              rows={4}
              placeholder="Provide a detailed reason for this override..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-danger-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Minimum 10 characters. This will be logged in the audit trail.
            </p>
          </div>

          <div>
            <label htmlFor="override-expiry" className="block text-sm font-medium text-neutral-700 mb-2">
              Expires At *
            </label>
            <input
              id="override-expiry"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              min={getMinExpiryDate()}
              max={getMaxExpiryDate()}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                errors.expiresAt ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300'
              )}
            />
            {errors.expiresAt && (
              <p className="mt-1 text-sm text-danger-600">{errors.expiresAt}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Override will automatically expire at this time. Range: 30 minutes to 7 days.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-warning-600 text-lg">⚠</span>
            <div>
              <h5 className="text-sm font-medium text-warning-800">Override Warning</h5>
              <p className="text-sm text-warning-700 mt-1">
                This override will bypass the validation rule and may impact safety or compliance. 
                Ensure this decision is justified and properly documented.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!formData.reason.trim() || !formData.expiresAt}
          >
            Apply Override
          </Button>
        </div>
      </div>
    </Modal>
  );
};
