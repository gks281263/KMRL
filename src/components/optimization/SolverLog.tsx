import React from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';

interface SolverLogProps {
  isRunning: boolean;
  progress: number;
  currentIteration: number;
  currentObjectiveValue: number;
  feasibility: 'feasible' | 'infeasible' | 'unknown';
  logs: Array<{
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
  }>;
  onCancel: () => void;
  className?: string;
}

export const SolverLog: React.FC<SolverLogProps> = ({
  isRunning,
  progress,
  currentIteration,
  currentObjectiveValue,
  feasibility,
  logs,
  onCancel,
  className,
}) => {
  const feasibilityColors = {
    feasible: 'text-success-600 bg-success-50',
    infeasible: 'text-danger-600 bg-danger-50',
    unknown: 'text-neutral-600 bg-neutral-50',
  };

  const logLevelColors = {
    info: 'text-blue-600',
    warning: 'text-warning-600',
    error: 'text-danger-600',
    success: 'text-success-600',
  };

  const logLevelIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700">
            {t('optimize.solver.progress')}
          </span>
          <span className="text-neutral-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">
            Iteration
          </div>
          <div className="text-lg font-mono text-neutral-900">
            {currentIteration.toLocaleString()}
          </div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">
            Objective Value
          </div>
          <div className="text-lg font-mono text-neutral-900">
            {currentObjectiveValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Feasibility Status */}
      <div className={cn(
        'px-3 py-2 rounded-lg text-sm font-medium',
        feasibilityColors[feasibility]
      )}>
        Feasibility: {feasibility.charAt(0).toUpperCase() + feasibility.slice(1)}
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        {isRunning ? (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
            aria-label="Cancel optimization"
          >
            {t('optimize.solver.cancel')}
          </button>
        ) : (
          <div className="text-sm text-neutral-500 text-center">
            Ready to run optimization
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-700">
          {t('optimize.solver.metrics')}
        </h4>
        <div className="bg-neutral-50 rounded-lg p-3 max-h-48 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-sm text-neutral-500 text-center py-4">
              No logs yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 text-sm"
                >
                  <span className="flex-shrink-0">{logLevelIcons[log.level]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-neutral-500">
                      {log.timestamp}
                    </div>
                    <div className={cn(
                      'text-neutral-700',
                      logLevelColors[log.level]
                    )}>
                      {log.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
