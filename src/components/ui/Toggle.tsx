import { cn } from '@/utils/cn';

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleProps) => {
  return (
    <div className={cn('flex items-center', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
          checked ? 'bg-primary-500' : 'bg-neutral-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </label>
      <label
        htmlFor={id}
        className={cn(
          'ml-3 text-sm font-medium text-neutral-700 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {label}
      </label>
    </div>
  );
};
