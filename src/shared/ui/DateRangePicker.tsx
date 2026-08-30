'use client';

import { useId, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import { Field } from './Field';
import { DatePicker } from './DatePicker';

export interface DateRangeValue {
  /** yyyy-MM-dd */
  start: string;
  end: string;
}

export interface DateRangePickerProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** 시작일을 고르면 종료일의 min이 따라 올라가 잘못된 범위를 애초에 막는다 */
export function DateRangePicker({
  label,
  hint,
  error,
  required,
  value,
  onChange,
  startLabel = '시작일',
  endLabel = '종료일',
  disabled,
  className,
}: DateRangePickerProps) {
  const groupId = useId();

  return (
    <Field htmlFor={`${groupId}-start`} label={label} required={required} hint={hint} error={error}>
      <div className={cn('flex items-center gap-2', className)}>
        <DatePicker
          id={`${groupId}-start`}
          aria-label={startLabel}
          value={value.start}
          max={value.end || undefined}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, start: event.target.value })}
          containerClassName="flex-1"
        />
        <span aria-hidden className="text-ink-500">
          ~
        </span>
        <DatePicker
          id={`${groupId}-end`}
          aria-label={endLabel}
          value={value.end}
          min={value.start || undefined}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, end: event.target.value })}
          containerClassName="flex-1"
        />
      </div>
    </Field>
  );
}
