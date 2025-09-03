import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { YardMap } from './YardMap';
import { ExportModal } from './ExportModal';
import { ExplainabilityModal } from './ExplainabilityModal';
import { OptimizationResult, ServiceTrain, StandbyTrain, MaintenanceTrain, ExplainabilityData } from '@/types/optimization';

interface ResultsPageProps {
  result: OptimizationResult;
  onApprove?: () => void;
  onTrackReassignment?: (trainId: string, newTrackId: string) => void;
  onReoptimize?: () => void;
  className?: string;
}

type TabType = 'service' | 'standby' | 'maintenance' | 'yardMap';

export const ResultsPage: React.FC<ResultsPageProps> = ({
  result,
  onApprove,
  onTrackReassignment,
  onReoptimize,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('service');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [explainabilityData, setExplainabilityData] = useState<ExplainabilityData | null>(null);
  const [isExplainabilityModalOpen, setIsExplainabilityModalOpen] = useState(false);

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: 'service', label: t('results.tabs.service'), count: result.service.length },
    { id: 'standby', label: t('results.tabs.standby'), count: result.standby.length },
    { id: 'maintenance', label: t('results.tabs.maintenance'), count: result.maintenance.length },
    { id: 'yardMap', label: t('results.tabs.yardMap'), count: 0 },
  ];

  const handleExport = async (format: 'pdf' | 'excel') => {
    console.log(`Exporting to ${format}...`);
    // In a real app, this would call the export API
  };

  const handleNotify = async (roles: string[]) => {
    console.log('Notifying roles:', roles);
    // In a real app, this would call the notification API
  };

  const handleViewExplainability = (trainId: string) => {
    // Mock data - in real app this would come from API
    const mockData: ExplainabilityData = {
      trainId,
      factors: [
        { factor: 'Branding Priority', weight: 0.8, evidence: 'Advertising contract expires in 3 days', impact: 'positive' as const },
        { factor: 'Mileage Balance', weight: 0.6, evidence: 'Below average monthly mileage', impact: 'positive' as const },
        { factor: 'Risk Mitigation', weight: 0.4, evidence: 'Recent maintenance completed', impact: 'positive' as const },
      ],
      totalScore: 0.85,
      constraints: ['Must depart before 06:00', 'Requires specific platform'],
      recommendations: ['Consider early departure to maximize branding exposure', 'Assign to platform 3 for optimal passenger flow'],
    };
    
    setExplainabilityData(mockData);
    setIsExplainabilityModalOpen(true);
  };

  const handleForceExclude = (trainId: string) => {
    console.log('Force excluding train:', trainId);
    // In a real app, this would call the API to exclude the train
  };

  const renderServiceTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.trainId')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.startTime')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.routeId')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.rationale')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.action')}</th>
          </tr>
        </thead>
        <tbody>
          {result.service.map((train) => (
            <tr key={train.trainId} className="border-b border-neutral-100 hover:bg-neutral-50">
              <td className="py-3 px-4 font-mono text-neutral-900">{train.trainId}</td>
              <td className="py-3 px-4 text-neutral-700">{train.startTime}</td>
              <td className="py-3 px-4 font-medium text-neutral-700">{train.routeId}</td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {train.rationale.slice(0, 2).map((factor, index) => (
                    <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                      {factor}
                    </span>
                  ))}
                  {train.rationale.length > 2 && (
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                      +{train.rationale.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewExplainability(train.trainId)}
                  >
                    {t('results.table.viewExplainability')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleForceExclude(train.trainId)}
                  >
                    {t('results.table.forceExclude')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStandbyTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.trainId')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.priorityRank')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.triggerCondition')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Location</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {result.standby.map((train) => (
            <tr key={train.trainId} className="border-b border-neutral-100 hover:bg-neutral-50">
              <td className="py-3 px-4 font-mono text-neutral-900">{train.trainId}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs rounded font-medium">
                  #{train.priorityRank}
                </span>
              </td>
              <td className="py-3 px-4 text-neutral-700">{train.triggerCondition}</td>
              <td className="py-3 px-4 text-neutral-700">{train.standbyLocation}</td>
              <td className="py-3 px-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewExplainability(train.trainId)}
                >
                  {t('results.table.viewExplainability')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMaintenanceTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.trainId')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.bay')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.plannedWork')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">{t('results.table.eta')}</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {result.maintenance.map((train) => (
            <tr key={train.trainId} className="border-b border-neutral-100 hover:bg-neutral-50">
              <td className="py-3 px-4 font-mono text-neutral-900">{train.trainId}</td>
              <td className="py-3 px-4 font-medium text-neutral-700">{train.bay}</td>
              <td className="py-3 px-4 text-neutral-700">{train.plannedWork}</td>
              <td className="py-3 px-4 text-neutral-700">{train.eta}</td>
              <td className="py-3 px-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewExplainability(train.trainId)}
                >
                  {t('results.table.viewExplainability')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={cn('min-h-screen bg-neutral-50 p-6', className)}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            {t('results.title')}
          </h1>
          <p className="text-lg text-neutral-600">
            {t('results.subtitle')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary-600">{result.service.length}</div>
            <div className="text-sm text-neutral-600">{t('results.summary.service')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-warning-600">{result.standby.length}</div>
            <div className="text-sm text-neutral-600">{t('results.summary.standby')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-danger-600">{result.maintenance.length}</div>
            <div className="text-sm text-neutral-600">{t('results.summary.maintenance')}</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-success-600">{result.meta.feasibilityScore}%</div>
            <div className="text-sm text-neutral-600">{t('results.summary.feasibility')}</div>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="p-0">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-neutral-100 text-neutral-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'service' && renderServiceTable()}
            {activeTab === 'standby' && renderStandbyTable()}
            {activeTab === 'maintenance' && renderMaintenanceTable()}
            {activeTab === 'yardMap' && (
              <YardMap
                data={result.yardMap}
                onTrackReassignment={onTrackReassignment}
                onReoptimize={onReoptimize}
              />
            )}
          </div>
        </Card>

        {/* Action Panel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onApprove && (
              <Button
                onClick={onApprove}
                disabled={result.meta.approvalStatus === 'pending'}
                variant="primary"
                size="lg"
              >
                {result.meta.approvalStatus === 'pending' 
                  ? t('results.approve.pending')
                  : t('results.approve.finalize')
                }
              </Button>
            )}
            {result.meta.requiredApprovals.length > 0 && (
              <div className="text-sm text-neutral-500">
                Required approvals: {result.meta.requiredApprovals.join(', ')}
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsExportModalOpen(true)}
            variant="secondary"
            size="lg"
          >
            Export & Notify
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        onNotify={handleNotify}
      />

      {explainabilityData && (
        <ExplainabilityModal
          isOpen={isExplainabilityModalOpen}
          onClose={() => setIsExplainabilityModalOpen(false)}
          data={explainabilityData}
        />
      )}
    </div>
  );
};
