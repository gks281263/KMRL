import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WhatIfScenario, PreviewResult, KPIDelta } from '@/types/optimization';

interface WhatIfPanelProps {
  onPreview: (scenario: WhatIfScenario) => Promise<PreviewResult>;
  onApprove: (approval: any) => void;
  onModifyRerun: () => void;
  className?: string;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  onPreview,
  onApprove,
  onModifyRerun,
  className,
}) => {
  const [scenario, setScenario] = useState<WhatIfScenario>({
    forceInclude: [],
    forceExclude: [],
    weightMods: {},
  });
  
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [isPreviewRunning, setIsPreviewRunning] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');
  const [password, setPassword] = useState('');

  const handleForceInclude = (trainId: string) => {
    setScenario(prev => ({
      ...prev,
      forceInclude: prev.forceInclude.includes(trainId)
        ? prev.forceInclude.filter(id => id !== trainId)
        : [...prev.forceInclude, trainId],
      forceExclude: prev.forceExclude.filter(id => id !== trainId),
    }));
  };

  const handleForceExclude = (trainId: string) => {
    setScenario(prev => ({
      ...prev,
      forceExclude: prev.forceExclude.includes(trainId)
        ? prev.forceExclude.filter(id => id !== trainId)
        : [...prev.forceExclude, trainId],
      forceInclude: prev.forceInclude.filter(id => id !== trainId),
    }));
  };

  const handleWeightMod = (factor: keyof WhatIfScenario['weightMods'], delta: number) => {
    setScenario(prev => ({
      ...prev,
      weightMods: {
        ...prev.weightMods,
        [factor]: (prev.weightMods[factor] || 0) + delta,
      },
    }));
  };

  const handlePreview = async () => {
    setIsPreviewRunning(true);
    try {
      const result = await onPreview(scenario);
      setPreviewResult(result);
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setIsPreviewRunning(false);
    }
  };

  const handleApprove = () => {
    if (!approvalReason.trim()) return;
    
    onApprove({
      reason: approvalReason,
      digitalSignature: digitalSignature.trim() || undefined,
      password: password.trim() || undefined,
      timestamp: new Date().toISOString(),
      approverId: 'current-user', // In real app, get from auth context
    });
    
    setIsApprovalModalOpen(false);
    setApprovalReason('');
    setDigitalSignature('');
    setPassword('');
  };

  const getKPIImpactIcon = (delta: KPIDelta) => {
    switch (delta.impact) {
      case 'improved': return '😊';
      case 'worsened': return '😞';
      case 'unchanged': return '😐';
      default: return '😐';
    }
  };

  const getKPIImpactColor = (delta: KPIDelta) => {
    switch (delta.impact) {
      case 'improved': return 'text-success-600';
      case 'worsened': return 'text-danger-600';
      case 'unchanged': return 'text-neutral-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-medium text-neutral-900">
        {t('review.whatIf.title')}
      </h3>

      {/* Force Include/Exclude */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            {t('review.whatIf.forceInclude')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {scenario.forceInclude.map((trainId) => (
              <span
                key={trainId}
                className="px-3 py-1 bg-success-100 text-success-700 text-sm rounded-full cursor-pointer hover:bg-success-200"
                onClick={() => handleForceInclude(trainId)}
              >
                {trainId} ✕
              </span>
            ))}
            <input
              type="text"
              placeholder="Add train ID"
              className="px-3 py-1 text-sm border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleForceInclude(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            {t('review.whatIf.forceExclude')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {scenario.forceExclude.map((trainId) => (
              <span
                key={trainId}
                className="px-3 py-1 bg-danger-100 text-danger-700 text-sm rounded-full cursor-pointer hover:bg-danger-200"
                onClick={() => handleForceExclude(trainId)}
              >
                {trainId} ✕
              </span>
            ))}
            <input
              type="text"
              placeholder="Add train ID"
              className="px-3 py-1 text-sm border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleForceExclude(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Weight Modifications */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700">
          {t('review.whatIf.weightMods')}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {(['branding', 'mileage', 'shunting', 'risk'] as const).map((factor) => (
            <div key={factor} className="flex items-center space-x-2">
              <span className="text-sm text-neutral-600 w-16">
                {t(`review.whatIf.${factor}`)}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleWeightMod(factor, -10)}
                className="w-8 h-8 p-0"
              >
                -10%
              </Button>
              <span className="text-sm font-medium text-neutral-700 min-w-[3rem] text-center">
                {scenario.weightMods[factor] || 0}%
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleWeightMod(factor, 10)}
                className="w-8 h-8 p-0"
              >
                +10%
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Button */}
      <Button
        onClick={handlePreview}
        disabled={isPreviewRunning}
        loading={isPreviewRunning}
        variant="primary"
        fullWidth
      >
        {isPreviewRunning ? t('review.whatIf.previewRunning') : t('review.whatIf.preview')}
      </Button>

      {/* Preview Results */}
      {previewResult && (
        <Card className="p-4 space-y-4">
          <h4 className="text-sm font-medium text-neutral-700">
            {t('review.whatIf.kpiDelta')}
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={cn('text-2xl mb-1', getKPIImpactColor(previewResult.kpiDelta))}>
                {getKPIImpactIcon(previewResult.kpiDelta)}
              </div>
              <div className="text-sm font-medium text-neutral-700">
                {t('review.planSummary.punctuality')}
              </div>
              <div className={cn('text-lg font-bold', getKPIImpactColor(previewResult.kpiDelta))}>
                {previewResult.kpiDelta.punctuality > 0 ? '+' : ''}{previewResult.kpiDelta.punctuality.toFixed(1)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className={cn('text-2xl mb-1', getKPIImpactColor(previewResult.kpiDelta))}>
                {getKPIImpactIcon(previewResult.kpiDelta)}
              </div>
              <div className="text-sm font-medium text-neutral-700">
                {t('review.planSummary.energy')}
              </div>
              <div className={cn('text-lg font-bold', getKPIImpactColor(previewResult.kpiDelta))}>
                {previewResult.kpiDelta.energy > 0 ? '+' : ''}{previewResult.kpiDelta.energy.toFixed(1)}
              </div>
            </div>
            
            <div className="text-center">
              <div className={cn('text-2xl mb-1', getKPIImpactColor(previewResult.kpiDelta))}>
                {getKPIImpactIcon(previewResult.kpiDelta)}
              </div>
              <div className="text-sm font-medium text-neutral-700">
                {t('review.planSummary.brandingHours')}
              </div>
              <div className={cn('text-lg font-bold', getKPIImpactColor(previewResult.kpiDelta))}>
                {previewResult.kpiDelta.brandingHours > 0 ? '+' : ''}{previewResult.kpiDelta.brandingHours.toFixed(1)}h
              </div>
            </div>
          </div>

          {/* Top Assignments Changes */}
          {previewResult.topAssignments.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-neutral-700">Top Assignment Changes</h5>
              <div className="space-y-1">
                {previewResult.topAssignments.slice(0, 5).map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between text-xs text-neutral-600">
                    <span className="font-mono">{assignment.trainId}</span>
                    <span>
                      #{assignment.previousRank} → #{assignment.newRank}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => setIsApprovalModalOpen(true)}
          variant="primary"
          fullWidth
          disabled={!previewResult}
        >
          {t('review.actions.approve')}
        </Button>
        
        <Button
          onClick={onModifyRerun}
          variant="secondary"
          fullWidth
        >
          {t('review.actions.modifyRerun')}
        </Button>
      </div>

      {/* Approval Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('review.actions.confirmApproval')}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('review.actions.approvalReason')} *
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Explain why you're approving this plan..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('review.actions.digitalSignature')}
                </label>
                <input
                  type="text"
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your digital signature"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('review.actions.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your password"
                />
              </div>
            </div>

            {/* Consequences Warning */}
            <div className="p-3 bg-warning-50 rounded-lg border border-warning-200">
              <h4 className="text-sm font-medium text-warning-800 mb-2">
                {t('review.actions.consequences')}
              </h4>
              <ul className="text-xs text-warning-700 space-y-1">
                <li>• {t('review.actions.notifications')}</li>
                <li>• {t('review.actions.lockRecords')}</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setIsApprovalModalOpen(false)}
                variant="secondary"
                className="flex-1"
              >
                {t('review.actions.cancel')}
              </Button>
              <Button
                onClick={handleApprove}
                variant="primary"
                className="flex-1"
                disabled={!approvalReason.trim()}
              >
                {t('review.actions.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
