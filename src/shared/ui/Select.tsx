import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import { Field, fieldDescriptionIds, inputBaseClass, inputStateClass } from './Field';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  options: SelectOption[];
  /** 선택 전 표시할 문구 */
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, containerClassName, className, id, required, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <Field
      htmlFor={selectId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescriptionIds(selectId, hint, error)}
          className={cn(
            inputBaseClass,
            inputStateClass(Boolean(error)),
            'h-10 appearance-none pr-9',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-500"
        />
      </div>
    </Field>
  );
});
