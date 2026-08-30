import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

import { Field, fieldDescriptionIds, inputBaseClass, inputStateClass } from './Field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** 입력 길이 표시 (maxLength와 함께 사용) */
  showCount?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, showCount, containerClassName, className, id, required, maxLength, value, ...props },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const length = typeof value === 'string' ? value.length : 0;

  return (
    <Field
      htmlFor={textareaId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescriptionIds(textareaId, hint, error)}
        className={cn(inputBaseClass, inputStateClass(Boolean(error)), 'min-h-32 py-2.5', className)}
        {...props}
      />

      {showCount && maxLength && (
        <p className="text-right text-caption text-ink-500">
          {length} / {maxLength}
        </p>
      )}
    </Field>
  );
});
