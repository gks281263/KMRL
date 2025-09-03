import React from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { XAIAnalysis, ContributingFactor } from '@/types/optimization';

interface XAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: XAIAnalysis;
  className?: string;
}

export const XAIModal: React.FC<XAIModalProps> = ({
  isOpen,
  onClose,
  data,
  className,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-danger-600 bg-danger-50';
      case 'medium': return 'text-warning-600 bg-warning-50';
      case 'low': return 'text-success-600 bg-success-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-success-600';
      case 'negative': return 'text-danger-600';
      case 'neutral': return 'text-neutral-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('review.xai.title')}>
      <div className="space-y-6">
        {/* Train ID Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-neutral-900">
            Train {data.trainId}
          </h3>
        </div>

        {/* Factor Weights */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-neutral-900">
            {t('review.xai.factorWeights')}
          </h4>
          <div className="space-y-3">
            {data.factorWeights.map((factor, index) => (
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
                      {factor.impact}
                    </span>
                    <span className="text-sm font-medium text-neutral-700">
                      Weight: {(factor.weight * 100).toFixed(0)}%
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

        {/* Constraint Violations */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-neutral-900">
            {t('review.xai.constraintViolations')}
          </h4>
          {data.constraintViolations.length > 0 ? (
            <div className="space-y-2">
              {data.constraintViolations.map((violation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-warning-50 rounded-lg border border-warning-200">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium flex-shrink-0',
                    getSeverityColor(violation.severity)
                  )}>
                    {violation.severity.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-700">
                      {violation.constraint}
                    </div>
                    <div className="text-xs text-neutral-600">
                      Impact: {violation.impact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-500 italic">No constraint violations</div>
          )}
        </div>

        {/* Alternative Ranks */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-neutral-900">
            {t('review.xai.alternativeRanks')}
          </h4>
          {data.alternativeRanks.length > 0 ? (
            <div className="space-y-2">
              {data.alternativeRanks.map((alt, index) => (
                <div key={index} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      {alt.scenario}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-neutral-500">
                        Rank: #{alt.rank}
                      </span>
                      <span className="text-xs text-neutral-500">
                        Score: {alt.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600">
                    <span className="font-medium">Factors:</span> {alt.factors.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-500 italic">No alternative scenarios available</div>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-neutral-900">Recommendations</h4>
          {data.recommendations.length > 0 ? (
            <div className="space-y-2">
              {data.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span className="text-success-500">💡</span>
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-500 italic">No recommendations available</div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="secondary">
            {t('review.xai.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
