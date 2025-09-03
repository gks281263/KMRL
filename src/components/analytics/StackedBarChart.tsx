import { Card } from '@/components/ui/Card';
import { BrandingComplianceData } from '@/types/analytics';
import { cn } from '@/utils/cn';

interface StackedBarChartProps {
  data: BrandingComplianceData[];
  title: string;
  isLoading?: boolean;
  className?: string;
}

export const StackedBarChart = ({ data, title, isLoading = false, className }: StackedBarChartProps) => {
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

  const chartHeight = 200;
  const chartWidth = 800;
  const padding = 60;
  const barWidth = 40;
  const barSpacing = 20;

  const maxTotal = Math.max(...data.map(d => d.total));
  const availableWidth = chartWidth - 2 * padding;
  const totalBars = data.length;
  const totalBarWidth = totalBars * barWidth + (totalBars - 1) * barSpacing;
  const startX = padding + (availableWidth - totalBarWidth) / 2;

  const getY = (value: number) => {
    return chartHeight - padding - (value / maxTotal) * (chartHeight - 2 * padding);
  };

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
                {Math.round(maxTotal * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((item, index) => {
            const x = startX + index * (barWidth + barSpacing);
            const compliantHeight = (item.compliant / maxTotal) * (chartHeight - 2 * padding);
            const nonCompliantHeight = (item.nonCompliant / maxTotal) * (chartHeight - 2 * padding);
            
            const compliantY = getY(item.compliant);
            const nonCompliantY = getY(item.compliant + item.nonCompliant);

            return (
              <g key={index}>
                {/* Compliant bar */}
                <rect
                  x={x}
                  y={compliantY}
                  width={barWidth}
                  height={compliantHeight}
                  fill="#10b981"
                  rx="2"
                />
                
                {/* Non-compliant bar */}
                <rect
                  x={x}
                  y={nonCompliantY}
                  width={barWidth}
                  height={nonCompliantHeight}
                  fill="#ef4444"
                  rx="2"
                />

                {/* Value labels */}
                <text
                  x={x + barWidth / 2}
                  y={compliantY - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {item.compliant}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={nonCompliantY - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {item.nonCompliant}
                </text>

                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {item.trainType}
                </text>

                {/* Compliance rate */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding + 35}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {item.complianceRate.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-neutral-600">Compliant</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-neutral-600">Non-compliant</span>
        </div>
      </div>
    </Card>
  );
};
