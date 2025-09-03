import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeightSlider } from './WeightSlider';
import { SolverLog } from './SolverLog';

interface OptimizationWeights {
  branding: number;
  mileage: number;
  shunting: number;
  risk: number;
}

interface SolverOptions {
  hardRules: boolean;
  softRelaxations: boolean;
  maxRuntime: number;
  gapThreshold: number;
}

interface Preset {
  id: string;
  name: string;
  weights: OptimizationWeights;
  options: SolverOptions;
}

const presets: Preset[] = [
  {
    id: 'default',
    name: t('optimize.presets.default'),
    weights: { branding: 50, mileage: 30, shunting: 10, risk: 10 },
    options: { hardRules: true, softRelaxations: false, maxRuntime: 300, gapThreshold: 0.01 }
  },
  {
    id: 'branding-first',
    name: t('optimize.presets.brandingFirst'),
    weights: { branding: 80, mileage: 10, shunting: 5, risk: 5 },
    options: { hardRules: true, softRelaxations: true, maxRuntime: 600, gapThreshold: 0.05 }
  },
  {
    id: 'reliability-first',
    name: t('optimize.presets.reliabilityFirst'),
    weights: { branding: 20, mileage: 40, shunting: 20, risk: 20 },
    options: { hardRules: true, softRelaxations: false, maxRuntime: 300, gapThreshold: 0.01 }
  },
  {
    id: 'energy-minimization',
    name: t('optimize.presets.energyMinimization'),
    weights: { branding: 10, mileage: 20, shunting: 60, risk: 10 },
    options: { hardRules: false, softRelaxations: true, maxRuntime: 450, gapThreshold: 0.02 }
  }
];

export const OptimizeSetup: React.FC = () => {
  const [weights, setWeights] = useState<OptimizationWeights>(presets[0].weights);
  const [options, setOptions] = useState<SolverOptions>(presets[0].options);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [currentObjectiveValue, setCurrentObjectiveValue] = useState(0);
  const [feasibility, setFeasibility] = useState<'feasible' | 'infeasible' | 'unknown'>('unknown');
  const [logs, setLogs] = useState<Array<{
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
  }>>([]);

  // Validate weights sum to 100
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.1;

  const handleWeightChange = (key: keyof OptimizationWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionChange = (key: keyof SolverOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetChange = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setWeights(preset.weights);
      setOptions(preset.options);
      setSelectedPreset(presetId);
    }
  };

  const addLog = (message: string, level: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, level }]);
  };

  const runOptimization = async () => {
    if (!isWeightValid) {
      addLog('Weights must sum to 100%', 'error');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentIteration(0);
    setCurrentObjectiveValue(0);
    setFeasibility('unknown');
    setLogs([]);

    addLog('Starting optimization...', 'info');

    // Simulate optimization progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          addLog('Optimization completed successfully', 'success');
          setFeasibility('feasible');
          return 100;
        }
        return prev + Math.random() * 10;
      });

      setCurrentIteration(prev => prev + Math.floor(Math.random() * 100));
      setCurrentObjectiveValue(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 1000);

    // Simulate some log messages
    setTimeout(() => addLog('Checking constraint feasibility...', 'info'), 2000);
    setTimeout(() => addLog('Initial solution found', 'success'), 5000);
    setTimeout(() => addLog('Optimizing objective function...', 'info'), 8000);
  };

  const cancelOptimization = () => {
    setIsRunning(false);
    addLog('Optimization cancelled by user', 'warning');
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            {t('optimize.title')}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('optimize.subtitle')}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Weights */}
          <Card className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">
                {t('optimize.weights.title')}
              </h2>
              <div className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                isWeightValid ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
              )}>
                {Math.round(totalWeight)}%
              </div>
            </div>

            <div className="space-y-6">
              <WeightSlider
                label={t('optimize.weights.branding')}
                value={weights.branding}
                onChange={(value) => handleWeightChange('branding', value)}
                tooltip={t('optimize.tooltips.branding')}
                preview={t('optimize.preview.branding')}
                color="accent"
              />
              <WeightSlider
                label={t('optimize.weights.mileage')}
                value={weights.mileage}
                onChange={(value) => handleWeightChange('mileage', value)}
                tooltip={t('optimize.tooltips.mileage')}
                preview={t('optimize.preview.mileage')}
                color="primary"
              />
              <WeightSlider
                label={t('optimize.weights.shunting')}
                value={weights.shunting}
                onChange={(value) => handleWeightChange('shunting', value)}
                tooltip={t('optimize.tooltips.shunting')}
                preview={t('optimize.preview.shunting')}
                color="success"
              />
              <WeightSlider
                label={t('optimize.weights.risk')}
                value={weights.risk}
                onChange={(value) => handleWeightChange('risk', value)}
                tooltip={t('optimize.tooltips.risk')}
                preview={t('optimize.preview.risk')}
                color="warning"
              />
            </div>
          </Card>

          {/* Middle Panel - Options */}
          <Card className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {t('optimize.options.title')}
            </h2>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.hardRules}
                  onChange={(e) => handleOptionChange('hardRules', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">
                  {t('optimize.options.hardRules')}
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.softRelaxations}
                  onChange={(e) => handleOptionChange('softRelaxations', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">
                  {t('optimize.options.softRelaxations')}
                </span>
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  {t('optimize.options.maxRuntime')}
                </label>
                <input
                  type="number"
                  min="60"
                  max="1800"
                  value={options.maxRuntime}
                  onChange={(e) => handleOptionChange('maxRuntime', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  {t('optimize.options.gapThreshold')}
                </label>
                <input
                  type="number"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={options.gapThreshold}
                  onChange={(e) => handleOptionChange('gapThreshold', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-neutral-900">
                {t('optimize.presets.title')}
              </h3>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {presets.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Right Panel - Solver Control */}
          <Card className="space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {t('optimize.solver.title')}
            </h2>

            <Button
              onClick={runOptimization}
              disabled={!isWeightValid || isRunning}
              loading={isRunning}
              fullWidth
              size="lg"
            >
              {t('optimize.solver.run')}
            </Button>

            <SolverLog
              isRunning={isRunning}
              progress={progress}
              currentIteration={currentIteration}
              currentObjectiveValue={currentObjectiveValue}
              feasibility={feasibility}
              logs={logs}
              onCancel={cancelOptimization}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
