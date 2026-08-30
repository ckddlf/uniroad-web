'use client';

import { useState, type ReactNode } from 'react';

import { Input } from './Input';
import { Select, type SelectOption } from './Select';

/** 목록에 없는 값을 직접 적겠다는 뜻의 내부 전용 값 */
const CUSTOM = '__custom__';

export interface SelectOrCustomProps {
  label: ReactNode;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 직접 입력 칸의 placeholder */
  customPlaceholder?: string;
  customLabel?: string;
  hint?: ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  inputType?: 'text' | 'number';
  inputMode?: 'text' | 'numeric';
  min?: number;
  max?: number;
  maxLength?: number;
}

/**
 * 드롭다운에서 고르되, "직접 입력"을 선택하면 자유롭게 적을 수 있는 입력.
 *
 * 목록에 없는 값이 이미 들어있으면(임시 저장본을 복원한 경우 등)
 * 별도 상태 없이도 직접 입력 상태로 열어준다.
 */
export function SelectOrCustom({
  label,
  options,
  value,
  onChange,
  placeholder = '선택해주세요',
  customPlaceholder,
  customLabel = '직접 입력',
  hint,
  error,
  disabled,
  required,
  inputType = 'text',
  inputMode,
  min,
  max,
  maxLength,
}: SelectOrCustomProps) {
  const [manual, setManual] = useState(false);

  const inOptions = options.some((option) => option.value === value);
  const showInput = !disabled && (manual || (value !== '' && !inOptions));

  return (
    <div className="flex flex-col gap-2">
      <Select
        label={label}
        required={required}
        placeholder={placeholder}
        hint={showInput ? undefined : hint}
        error={showInput ? undefined : error}
        disabled={disabled}
        options={[...options, { value: CUSTOM, label: customLabel }]}
        value={showInput ? CUSTOM : value}
        onChange={(event) => {
          const next = event.target.value;
          if (next === CUSTOM) {
            setManual(true);
            onChange('');
            return;
          }
          setManual(false);
          onChange(next);
        }}
      />

      {showInput && (
        <Input
          aria-label={typeof label === 'string' ? `${label} 직접 입력` : undefined}
          placeholder={customPlaceholder}
          hint={hint}
          error={error}
          type={inputType}
          inputMode={inputMode}
          min={min}
          max={max}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
