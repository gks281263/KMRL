import { Card } from '@/components/ui/Card';
import { ShuntingHeatmapData } from '@/types/analytics';
import { cn } from '@/utils/cn';

interface HeatmapProps {
  data: ShuntingHeatmapData[];
  title: string;
  isLoading?: boolean;
  className?: string;
}

export const Heatmap = ({ data, title, isLoading = false, className }: HeatmapProps) => {
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

  // Process data for heatmap
  const timeSlots = [...new Set(data.map(d => d.timeSlot))].sort();
  const dates = [...new Set(data.map(d => d.date))].sort();
  
  const maxShuntingTime = Math.max(...data.map(d => d.shuntingOperations || 0));
  const maxFrequency = Math.max(...data.map(d => d.trainsMoved || 0));

  const getCellData = (date: string, timeSlot: string) => {
    return data.find(d => d.date === date && d.timeSlot === timeSlot) || null;
  };

  const getColor = (shuntingTime: number, frequency: number) => {
    if (isNaN(shuntingTime) || isNaN(frequency) || maxShuntingTime === 0 || maxFrequency === 0) {
      return '#f3f4f6'; // gray-100
    }
    
    const timeIntensity = shuntingTime / maxShuntingTime;
    const freqIntensity = frequency / maxFrequency;
    const intensity = (timeIntensity + freqIntensity) / 2;
    
    if (intensity > 0.8) return '#dc2626'; // red-600
    if (intensity > 0.6) return '#ea580c'; // orange-600
    if (intensity > 0.4) return '#d97706'; // amber-600
    if (intensity > 0.2) return '#eab308'; // yellow-500
    return '#f3f4f6'; // gray-100
  };

  const cellSize = 30;
  const padding = 60;
  const chartWidth = dates.length * cellSize + padding;
  const chartHeight = timeSlots.length * cellSize + padding;

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
          {/* Y-axis labels (time slots) */}
          {timeSlots.map((timeSlot, index) => (
            <text
              key={timeSlot}
              x={padding - 10}
              y={padding + index * cellSize + cellSize / 2}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
              dominantBaseline="middle"
            >
              {timeSlot}
            </text>
          ))}

          {/* X-axis labels (dates) */}
          {dates.map((date, index) => (
            <text
              key={date}
              x={padding + index * cellSize + cellSize / 2}
              y={padding - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
              dominantBaseline="middle"
            >
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}

          {/* Heatmap cells */}
          {dates.map((date, dateIndex) => 
            timeSlots.map((timeSlot, timeIndex) => {
              const cellData = getCellData(date, timeSlot);
              const x = padding + dateIndex * cellSize;
              const y = padding + timeIndex * cellSize;
              
              return (
                <g key={`${date}-${timeSlot}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={cellData ? getColor(cellData.shuntingOperations, cellData.trainsMoved) : '#f9fafb'}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  {cellData && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2}
                      textAnchor="middle"
                      fontSize="10"
                      fill={cellData.shuntingOperations > maxShuntingTime * 0.5 ? 'white' : '#374151'}
                      dominantBaseline="middle"
                    >
                      {cellData.shuntingOperations || 0}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
          <span className="text-neutral-600">Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 border border-gray-300"></div>
          <span className="text-neutral-600">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-600 border border-gray-300"></div>
          <span className="text-neutral-600">High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-600 border border-gray-300"></div>
          <span className="text-neutral-600">Very High</span>
        </div>
      </div>

      <div className="text-center text-xs text-neutral-500 mt-2">
        Shunting time in minutes
      </div>
    </Card>
  );
};
