'use client';

import { useId, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  const labelId = useId();

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {label && (
        <span id={labelId} className="text-body text-ink-900">
          {label}
          {description && <span className="mt-0.5 block text-caption text-ink-500">{description}</span>}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand-500' : 'bg-ink-300',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}
