import { cn } from '@/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export const Select = ({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  required = false,
  className,
}: SelectProps) => {
  const hasError = !!error;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-700"
      >
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
          hasError
            ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
            : 'border-neutral-300'
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      >
        <option value="">Select a role</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p
          id={`${id}-error`}
          className="text-sm text-danger-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
