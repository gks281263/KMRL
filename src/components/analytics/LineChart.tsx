import { Card } from '@/components/ui/Card';
import { MileageVarianceData } from '@/types/analytics';
import { cn } from '@/utils/cn';

interface LineChartProps {
  data: MileageVarianceData[];
  title: string;
  isLoading?: boolean;
  className?: string;
}

export const LineChart = ({ data, title, isLoading = false, className }: LineChartProps) => {
  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-neutral-500">
          No data available
        </div>
      </Card>
    );
  }

  // Simple line chart implementation
  const maxVariance = Math.max(...data.map(d => Math.abs(d.variance || 0)));
  const chartHeight = 200;
  const chartWidth = 800;
  const padding = 40;

  const getY = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return chartHeight - padding;
    const normalized = (value / maxVariance) * (chartHeight - 2 * padding);
    return chartHeight - padding - normalized;
  };

  const getX = (index: number) => {
    if (data.length <= 1) return padding;
    return padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
  };

  const points = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item.variance);
    return `${x},${y}`;
  }).join(' ');

  const plannedPoints = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item.plannedMileage);
    return `${x},${y}`;
  }).join(' ');

  const actualPoints = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item.actualMileage);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
      
      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={padding + ratio * (chartHeight - 2 * padding)}
                x2={chartWidth - padding}
                y2={padding + ratio * (chartHeight - 2 * padding)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + ratio * (chartHeight - 2 * padding) + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {Math.round(maxVariance * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((item, index) => (
            <text
              key={index}
              x={getX(index)}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}

          {/* Planned line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={plannedPoints}
          />

          {/* Actual line */}
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            points={actualPoints}
          />

          {/* Variance line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5,5"
            points={points}
          />

          {/* Data points */}
          {data.map((item, index) => (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(item.plannedMileage)}
                r="3"
                fill="#3b82f6"
              />
              <circle
                cx={getX(index)}
                cy={getY(item.actualMileage)}
                r="3"
                fill="#ef4444"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-neutral-600">Planned</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-neutral-600">Actual</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-neutral-600">Variance</span>
        </div>
      </div>
    </Card>
  );
};
