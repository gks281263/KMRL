import React, { useState, useRef } from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';
import { YardMapData, Track, TrackedTrain, ShuntingPath } from '@/types/optimization';

interface YardMapProps {
  data: YardMapData;
  onTrackReassignment?: (trainId: string, newTrackId: string) => void;
  onReoptimize?: () => void;
  className?: string;
}

export const YardMap: React.FC<YardMapProps> = ({
  data,
  onTrackReassignment,
  onReoptimize,
  className,
}) => {
  const [hoveredTrain, setHoveredTrain] = useState<TrackedTrain | null>(null);
  const [draggedTrain, setDraggedTrain] = useState<TrackedTrain | null>(null);
  const [dragOverTrack, setDragOverTrack] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleTrainDragStart = (train: TrackedTrain, e: React.DragEvent) => {
    setDraggedTrain(train);
    e.dataTransfer.setData('text/plain', train.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTrackDragOver = (trackId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTrack(trackId);
  };

  const handleTrackDrop = (trackId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTrain && onTrackReassignment) {
      onTrackReassignment(draggedTrain.id, trackId);
    }
    setDraggedTrain(null);
    setDragOverTrack(null);
  };

  const getTrackColor = (track: Track) => {
    if (dragOverTrack === track.id) return 'fill-accent-200 stroke-accent-500';
    
    switch (track.status) {
      case 'available': return 'fill-neutral-100 stroke-neutral-300';
      case 'occupied': return 'fill-primary-100 stroke-primary-500';
      case 'maintenance': return 'fill-warning-100 stroke-warning-500';
      case 'reserved': return 'fill-accent-100 stroke-accent-500';
      default: return 'fill-neutral-100 stroke-neutral-300';
    }
  };

  const getTrainIcon = (train: TrackedTrain) => {
    const baseClasses = 'cursor-move transition-all duration-200';
    
    switch (train.status) {
      case 'moving': return cn(baseClasses, 'text-primary-600 animate-pulse');
      case 'loading': return cn(baseClasses, 'text-warning-600');
      case 'unloading': return cn(baseClasses, 'text-warning-600');
      default: return cn(baseClasses, 'text-neutral-700');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with instructions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-neutral-900">
          {t('results.tabs.yardMap')}
        </h3>
        <div className="text-sm text-neutral-500">
          {t('results.yardMap.dragDrop')}
        </div>
      </div>

      {/* SVG Yard Map */}
      <div className="relative bg-white rounded-lg border border-neutral-200 p-4 overflow-auto">
        <svg
          ref={svgRef}
          width="800"
          height="600"
          viewBox="0 0 800 600"
          className="w-full h-auto"
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Tracks */}
          {data.tracks.map((track) => (
            <g key={track.id}>
              <rect
                x={track.x}
                y={track.y}
                width={track.length}
                height={track.width}
                className={cn(
                  'stroke-2 transition-colors duration-200',
                  getTrackColor(track)
                )}
                onDragOver={(e) => handleTrackDragOver(track.id, e)}
                onDrop={(e) => handleTrackDrop(track.id, e)}
                onDragLeave={() => setDragOverTrack(null)}
              />
              <text
                x={track.x + track.length / 2}
                y={track.y + track.width / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium text-neutral-600 pointer-events-none"
              >
                {track.name}
              </text>
            </g>
          ))}

          {/* Shunting Paths */}
          {data.paths.map((path) => (
            <g key={path.id}>
              <path
                d={`M ${path.path.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </g>
          ))}

          {/* Trains */}
          {data.trains.map((train) => {
            const track = data.tracks.find(t => t.id === train.trackId);
            if (!track) return null;

            return (
              <g key={train.id}>
                <circle
                  cx={track.x + track.length / 2}
                  cy={track.y + track.width / 2}
                  r="8"
                  className={cn(
                    'fill-current transition-all duration-200',
                    getTrainIcon(train)
                  )}
                  // draggable attribute not supported on SVG elements
                  onDragStart={(e) => handleTrainDragStart(train, e)}
                  onMouseEnter={() => setHoveredTrain(train)}
                  onMouseLeave={() => setHoveredTrain(null)}
                />
                <text
                  x={track.x + track.length / 2}
                  y={track.y + track.width / 2 + 20}
                  textAnchor="middle"
                  className="text-xs font-medium text-neutral-700 pointer-events-none"
                >
                  {train.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredTrain && (
          <div className="absolute bg-neutral-900 text-white p-3 rounded-lg shadow-lg text-sm max-w-xs z-10 pointer-events-none">
            <div className="font-medium mb-2">
              {t('results.yardMap.tooltip.title')}: {hoveredTrain.id}
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-neutral-300">{t('results.yardMap.tooltip.assignedTask')}:</span>
                <span className="ml-2">{hoveredTrain.assignedTask}</span>
              </div>
              {hoveredTrain.shuntingPath && (
                <div>
                  <span className="text-neutral-300">{t('results.yardMap.tooltip.shuntingPath')}:</span>
                  <span className="ml-2">{hoveredTrain.shuntingPath}</span>
                </div>
              )}
              <div>
                <span className="text-neutral-300">Status:</span>
                <span className="ml-2 capitalize">{hoveredTrain.status}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Re-optimize Button */}
      {onReoptimize && (
        <div className="flex justify-center">
          <button
            onClick={onReoptimize}
            className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
          >
            {t('results.yardMap.reoptimize')}
          </button>
        </div>
      )}
    </div>
  );
};
