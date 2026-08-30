import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import { Field, fieldDescriptionIds, inputBaseClass, inputStateClass } from './Field';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** 오른쪽에 붙는 부가 요소 (중복확인 상태, 단위 등) */
  suffix?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, suffix, containerClassName, className, id, required, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Field
      htmlFor={inputId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescriptionIds(inputId, hint, error)}
          className={cn(
            inputBaseClass,
            inputStateClass(Boolean(error)),
            'h-10',
            suffix && 'pr-24',
            className,
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-3 flex items-center text-caption text-ink-500">
            {suffix}
          </div>
        )}
      </div>
    </Field>
  );
});
