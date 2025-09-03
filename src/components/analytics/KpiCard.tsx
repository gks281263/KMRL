import { Card } from '@/components/ui/Card';
import { KpiData } from '@/types/analytics';
import { cn } from '@/utils/cn';

interface KpiCardProps {
  kpi: KpiData;
  className?: string;
}

export const KpiCard = ({ kpi, className }: KpiCardProps) => {
  const getTrendIcon = (trend: KpiData['trend']) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: KpiData['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-danger-600';
      case 'stable':
        return 'text-neutral-600';
      default:
        return 'text-neutral-600';
    }
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-success-600';
    if (delta < 0) return 'text-danger-600';
    return 'text-neutral-600';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'km') {
      return `${value.toFixed(0)} km`;
    }
    if (unit === 'min') {
      return `${value.toFixed(0)} min`;
    }
    return `${value.toFixed(2)} ${unit}`;
  };

  const formatDelta = (delta: number) => {
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
  };

  // Simple sparkline rendering
  const renderSparkline = (data: number[]) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        className="w-full h-8"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          points={points}
          className={cn(
            'transition-colors',
            kpi.trend === 'up' ? 'text-success-500' :
            kpi.trend === 'down' ? 'text-danger-500' : 'text-neutral-400'
          )}
        />
      </svg>
    );
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-1">
            {kpi.name}
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-neutral-900">
              {formatValue(kpi.value, kpi.unit)}
            </span>
            <span className={cn(
              'text-sm font-medium flex items-center space-x-1',
              getDeltaColor(kpi.delta)
            )}>
              <span>{getTrendIcon(kpi.trend)}</span>
              <span>{formatDelta(kpi.delta)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-8 mb-2">
        {renderSparkline(kpi.sparkline)}
      </div>

      {/* Last updated */}
      <div className="text-xs text-neutral-500">
        Last updated: {new Date(kpi.lastUpdated).toLocaleTimeString()}
      </div>
    </Card>
  );
};
