import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = ({ children, className, padding = 'md' }: CardProps) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-card border border-neutral-200',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};
