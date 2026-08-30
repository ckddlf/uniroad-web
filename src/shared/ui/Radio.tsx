import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
  containerClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, containerClassName, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn('flex items-start gap-2', containerClassName)}>
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className={cn(
          'mt-0.5 size-4 shrink-0 cursor-pointer border-ink-300 accent-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
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
  );
});

export interface RadioGroupProps {
  legend?: ReactNode;
  error?: string;
  required?: boolean;
  /** 가로 배치 여부 */
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

/** 라디오 묶음은 fieldset/legend로 감싸 스크린리더가 그룹으로 읽게 한다 */
export function RadioGroup({ legend, error, required, inline, className, children }: RadioGroupProps) {
  return (
    <fieldset className={cn('flex flex-col gap-2', className)}>
      {legend && (
        <legend className="mb-1 text-label font-medium text-ink-700">
          {legend}
          {required && (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          )}
        </legend>
      )}

      <div className={cn(inline ? 'flex flex-wrap items-center gap-6' : 'flex flex-col gap-2')}>
        {children}
      </div>

      {error && (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
