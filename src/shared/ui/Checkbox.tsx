import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, containerClassName, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'mt-0.5 size-4 shrink-0 cursor-pointer rounded-sm border-ink-300 text-brand-500',
            'accent-brand-500 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="cursor-pointer text-body text-ink-900 select-none">
            {label}
            {description && <span className="mt-0.5 block text-caption text-ink-500">{description}</span>}
          </label>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
