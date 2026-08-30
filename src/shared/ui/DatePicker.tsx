import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import { Field, fieldDescriptionIds, inputBaseClass, inputStateClass } from './Field';

/**
 * 날짜 입력은 브라우저 기본 date 입력을 쓴다.
 * 값 포맷이 서버 전송 포맷(yyyy-MM-dd)과 같고 키보드 접근성도 확보된다.
 */
export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  containerClassName?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, hint, error, containerClassName, className, id, required, ...props },
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
      <input
        ref={ref}
        id={inputId}
        type="date"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescriptionIds(inputId, hint, error)}
        className={cn(inputBaseClass, inputStateClass(Boolean(error)), 'h-10', className)}
        {...props}
      />
    </Field>
  );
});
