import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { operationsApi } from '@/services/api/operations';
import { Incident, FaultTemplate } from '@/types/operations';
import { t } from '@/utils/i18n';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: Omit<Incident, 'id' | 'reportedAt' | 'status'>) => Promise<void>;
  trainId?: string;
  serviceId?: string;
  initialType?: Incident['type'];
}

export const IncidentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  trainId, 
  serviceId, 
  initialType 
}: IncidentModalProps) => {
  const [formData, setFormData] = useState({
    trainId: trainId || '',
    serviceId: serviceId || '',
    type: initialType || 'mechanical' as Incident['type'],
    severity: 'medium' as Incident['severity'],
    description: '',
    faultCode: ''
  });
  
  const [faultTemplates, setFaultTemplates] = useState<FaultTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFaultTemplates();
    }
  }, [isOpen]);

  const loadFaultTemplates = async () => {
    try {
      const response = await operationsApi.getFaultTemplates();
      if (response.success) {
        setFaultTemplates(response.data);
      }
    } catch (err) {
      console.error('Failed to load fault templates:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trainId || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit({
        trainId: formData.trainId,
        serviceId: formData.serviceId,
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        faultCode: formData.faultCode || undefined,
        reportedBy: 'current_user' // This would come from auth context
      });
      
      onClose();
      setFormData({
        trainId: trainId || '',
        serviceId: serviceId || '',
        type: initialType || 'mechanical',
        severity: 'medium',
        description: '',
        faultCode: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report incident');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: FaultTemplate) => {
    setFormData(prev => ({
      ...prev,
      type: template.category,
      severity: template.severity,
      description: template.description,
      faultCode: template.code
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('ops.incident.title')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Templates */}
        {faultTemplates.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-3">
              {t('ops.incident.quickTemplates')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {faultTemplates.slice(0, 6).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className="text-left p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="text-sm font-medium text-neutral-900">
                    {template.code}
                  </div>
                  <div className="text-xs text-neutral-600 truncate">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="trainId" className="block text-sm font-medium text-neutral-700 mb-1">
              {t('ops.incident.trainId')} *
            </label>
            <input
              id="trainId"
              type="text"
              value={formData.trainId}
              onChange={(e) => handleInputChange('trainId', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-neutral-700 mb-1">
              {t('ops.incident.serviceId')}
            </label>
            <input
              id="serviceId"
              type="text"
              value={formData.serviceId}
              onChange={(e) => handleInputChange('serviceId', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
              {t('ops.incident.type')} *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="mechanical">{t('ops.incident.types.mechanical')}</option>
              <option value="electrical">{t('ops.incident.types.electrical')}</option>
              <option value="operational">{t('ops.incident.types.operational')}</option>
              <option value="safety">{t('ops.incident.types.safety')}</option>
              <option value="other">{t('ops.incident.types.other')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-neutral-700 mb-1">
              {t('ops.incident.severity')} *
            </label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="low">{t('ops.incident.severity.low')}</option>
              <option value="medium">{t('ops.incident.severity.medium')}</option>
              <option value="high">{t('ops.incident.severity.high')}</option>
              <option value="critical">{t('ops.incident.severity.critical')}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="faultCode" className="block text-sm font-medium text-neutral-700 mb-1">
            {t('ops.incident.faultCode')}
          </label>
          <input
            id="faultCode"
            type="text"
            value={formData.faultCode}
            onChange={(e) => handleInputChange('faultCode', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., MECH-001, ELEC-002"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
            {t('ops.incident.description')} *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={t('ops.incident.descriptionPlaceholder')}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="danger"
            loading={isLoading}
          >
            {t('ops.incident.report')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
