import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel') => void;
  onNotify: (roles: string[]) => void;
  className?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onNotify,
  className,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      await onExport(format);
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsExporting(false);
    }
  };

  const handleNotify = async () => {
    if (selectedRoles.length === 0) return;
    
    setIsNotifying(true);
    try {
      await onNotify(selectedRoles);
      // Simulate notification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } finally {
      setIsNotifying(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const notificationRoles = [
    { id: 'depot-ops', label: t('results.export.notifyDepotOps'), description: 'Operations staff and yard managers' },
    { id: 'signalling', label: t('results.export.notifySignalling'), description: 'Signalling and control room staff' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('results.export.title')}>
      <div className="space-y-6">
        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">Export Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              loading={isExporting}
              variant="secondary"
              fullWidth
            >
              {t('results.export.pdf')}
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              loading={isExporting}
              variant="secondary"
              fullWidth
            >
              {t('results.export.excel')}
            </Button>
          </div>
        </div>

        {/* Notification Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">Send Notifications</h3>
          <div className="space-y-3">
            {notificationRoles.map((role) => (
              <label key={role.id} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-700">
                    {role.label}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {role.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          <Button
            onClick={handleNotify}
            disabled={selectedRoles.length === 0 || isNotifying}
            loading={isNotifying}
            variant="primary"
            fullWidth
          >
            {t('results.export.notify')}
          </Button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isExporting || isNotifying}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
