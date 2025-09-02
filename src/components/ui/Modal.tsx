import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { ModalProps } from '@/types/common';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape, closeOnOverlayClick]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-modal-backdrop bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-2xl shadow-xl w-full',
          sizeClasses[size],
          'focus:outline-none'
        )}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 id="modal-title" className="text-xl font-semibold text-neutral-900">
            {title}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
