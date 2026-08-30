import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface FieldProps {
  /** 입력 요소의 id — label·설명·에러를 연결한다 */
  htmlFor: string;
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function fieldDescriptionIds(id: string, hint?: ReactNode, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/** 라벨·도움말·에러 문구의 배치와 접근성 연결을 한곳에서 처리한다 */
export function Field({ htmlFor, label, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-label font-medium text-ink-700">
          {label}
          {required && (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-caption text-ink-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** 입력 요소 공통 스타일 */
export const inputBaseClass = cn(
  'w-full rounded-md border bg-surface px-3 text-body text-ink-900 transition-colors',
  'placeholder:text-ink-300',
  'disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500',
);

export function inputStateClass(hasError?: boolean): string {
  return hasError
    ? 'border-danger focus:border-danger'
    : 'border-ink-300 hover:border-ink-500 focus:border-brand-500';
}
