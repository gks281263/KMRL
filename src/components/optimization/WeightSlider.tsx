import React from 'react';
import { cn } from '@/utils/cn';
import { t } from '@/utils/i18n';

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
  preview: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  disabled?: boolean;
  className?: string;
}

export const WeightSlider: React.FC<WeightSliderProps> = ({
  label,
  value,
  onChange,
  tooltip,
  preview,
  color,
  disabled = false,
  className,
}) => {
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    accent: 'bg-accent-500',
  };

  const trackColor = value > 0 ? colorClasses[color] : 'bg-neutral-300';

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        <span className="text-sm font-mono text-neutral-600">
          {value}%
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'w-full h-2 appearance-none rounded-lg cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:rounded-lg',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-lg',
            '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:shadow-md'
          )}
          style={{
            background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${value}%, var(--color-neutral-200) ${value}%, var(--color-neutral-200) 100%)`
          }}
          aria-label={`Adjust ${label} weight`}
          aria-describedby={`${label.toLowerCase()}-tooltip`}
        />
      </div>

      {/* Preview text */}
      <p className="text-xs text-neutral-500 leading-relaxed">
        {preview}
      </p>

      {/* Tooltip */}
      <div className="group relative">
        <button
          type="button"
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-describedby={`${label.toLowerCase()}-tooltip`}
        >
          ℹ️ Info
        </button>
        <div
          id={`${label.toLowerCase()}-tooltip`}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-neutral-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
          role="tooltip"
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
        </div>
      </div>
    </div>
  );
};
