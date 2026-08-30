'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  /** 탭 라벨 옆 개수 표시 */
  count?: number;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 목록 필터 탭은 아래쪽 밑줄, 세그먼트형은 pill */
  variant?: 'underline' | 'pill';
  className?: string;
  'aria-label'?: string;
}

/** ←→ 키로 탭 사이를 이동할 수 있는 탭 목록 */
export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    const currentIndex = items.findIndex((item) => item.value === value);
    if (currentIndex === -1) return;

    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    event.preventDefault();
    onChange(items[nextIndex].value);

    const buttons = listRef.current?.querySelectorAll('button');
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        variant === 'underline'
          ? 'flex items-center gap-1 border-b border-ink-100'
          : 'inline-flex items-center gap-1 rounded-full bg-ink-100 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex items-center gap-1.5 text-body font-medium transition-colors',
              variant === 'underline'
                ? cn(
                    '-mb-px border-b-2 px-4 py-2.5',
                    selected
                      ? 'border-brand-500 text-brand-700'
                      : 'border-transparent text-ink-500 hover:text-ink-700',
                  )
                : cn(
                    'rounded-full px-4 py-1.5',
                    selected ? 'bg-surface text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700',
                  ),
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn('text-caption', selected ? 'text-brand-600' : 'text-ink-500')}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
