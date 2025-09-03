import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
// Table component not available, using div instead
import { PlanSummary, XAIAnalysis, WhatIfScenario, PreviewResult } from '@/types/optimization';
import { XAIModal } from './XAIModal';
import { WhatIfPanel } from './WhatIfPanel';

interface ReviewPageProps {
  planSummary: PlanSummary;
  trains: Array<{
    id: string;
    type: 'service' | 'standby' | 'maintenance';
    status: string;
    explainability: XAIAnalysis;
  }>;
  onPreview: (scenario: WhatIfScenario) => Promise<PreviewResult>;
  onApprove: (approval: any) => void;
  onModifyRerun: () => void;
  className?: string;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  planSummary,
  trains,
  onPreview,
  onApprove,
  onModifyRerun,
  className,
}) => {
  const [selectedTrain, setSelectedTrain] = useState<XAIAnalysis | null>(null);
  const [isXAIModalOpen, setIsXAIModalOpen] = useState(false);

  const handleTrainClick = (train: XAIAnalysis) => {
    setSelectedTrain(train);
    setIsXAIModalOpen(true);
  };

  const handleCloseXAIModal = () => {
    setIsXAIModalOpen(false);
    setSelectedTrain(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      case 'under_review':
        return '🔍';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-success-600';
      case 'pending':
        return 'text-warning-600';
      case 'rejected':
        return 'text-danger-600';
      case 'under_review':
        return 'text-primary-600';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">
          {t('review.title')}
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">
            {t('review.lastUpdated')}: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Plan Summary */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              {t('review.planSummary.title')}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {t('review.planSummary.punctuality')}
                </span>
                <span className="text-lg font-bold text-success-600">
                  {planSummary.punctuality}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {t('review.planSummary.energy')}
                </span>
                <span className="text-lg font-bold text-primary-600">
                  {planSummary.energy}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {t('review.planSummary.brandingHours')}
                </span>
                <span className="text-lg font-bold text-accent-600">
                  {planSummary.brandingHours}h
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {t('review.planSummary.totalTrains')}
                </span>
                <span className="text-lg font-bold text-neutral-700">
                  {planSummary.totalTrains}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {t('review.planSummary.estimatedSavings')}
                </span>
                <span className="text-lg font-bold text-success-600">
                  ${planSummary.estimatedSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Panel - Train List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              {t('review.trains.title')}
            </h2>
            
            <div className="space-y-3">
              {trains.map((train) => (
                <div
                  key={train.id}
                  className="p-3 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                  onClick={() => handleTrainClick(train.explainability)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-neutral-900">
                      {t('review.trains.trainId')}: {train.id}
                    </span>
                    <span className={cn('text-sm font-medium', getStatusColor(train.status))}>
                      {getStatusIcon(train.status)} {train.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <span>{t('review.trains.type')}: {train.type}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        handleTrainClick(train.explainability);
                      }}
                    >
                      {t('review.trains.viewExplainability')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel - What-If Controls */}
        <div className="lg:col-span-1">
          <WhatIfPanel
            onPreview={onPreview}
            onApprove={onApprove}
            onModifyRerun={onModifyRerun}
          />
        </div>
      </div>

      {/* Bottom Panel - Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6 border-t border-neutral-200">
        <Button
          onClick={() => {
            // This would typically open a more comprehensive approval flow
            console.log('Opening comprehensive approval flow');
          }}
          variant="primary"
          size="lg"
        >
          {t('review.actions.approvePlan')}
        </Button>
        
        <Button
          onClick={onModifyRerun}
          variant="secondary"
          size="lg"
        >
          {t('review.actions.modifyRerun')}
        </Button>
      </div>

      {/* XAI Modal */}
      {selectedTrain && (
        <XAIModal
          isOpen={isXAIModalOpen}
          onClose={handleCloseXAIModal}
          data={selectedTrain}
        />
      )}
    </div>
  );
};
