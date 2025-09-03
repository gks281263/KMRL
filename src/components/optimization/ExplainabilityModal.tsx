import React from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ContributingFactor } from '@/types/optimization';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    trainId: string;
    factors: ContributingFactor[];
    totalScore: number;
    constraints: string[];
    recommendations: string[];
  };
  className?: string;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  data,
  className,
}) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-success-600 bg-success-50';
      case 'negative': return 'text-danger-600 bg-danger-50';
      case 'neutral': return 'text-neutral-600 bg-neutral-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '✅';
      case 'negative': return '❌';
      case 'neutral': return '➖';
      default: return '➖';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('results.explainability.title')}>
      <div className="space-y-6">
        {/* Train ID Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-neutral-900">
            Train {data.trainId}
          </h3>
          <div className="text-sm text-neutral-500">
            Total Score: {data.totalScore.toFixed(2)}
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-neutral-900">
            {t('results.explainability.contributingFactors')}
          </h4>
          <div className="space-y-3">
            {data.factors.map((factor, index) => (
              <div
                key={index}
                className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      getImpactColor(factor.impact)
                    )}>
                      {getImpactIcon(factor.impact)} {factor.factor}
                    </span>
                    <span className="text-sm font-medium text-neutral-700">
                      Weight: {factor.weight}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-neutral-600">
                  <span className="font-medium">{t('results.explainability.evidence')}:</span> {factor.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        {data.constraints.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-neutral-900">Constraints</h4>
            <div className="space-y-2">
              {data.constraints.map((constraint, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span className="text-warning-500">⚠️</span>
                  <span>{constraint}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-neutral-900">Recommendations</h4>
            <div className="space-y-2">
              {data.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span className="text-success-500">💡</span>
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="secondary">
            {t('results.explainability.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
