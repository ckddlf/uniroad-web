import type { ReactNode } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

export interface ChipProps {
  /** 선택 가능한 필터 칩으로 쓸 때 */
  selected?: boolean;
  onClick?: () => void;
  /** 값이 있으면 제거 버튼이 붙는다 */
  onRemove?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/** 필터·태그처럼 누르거나 지울 수 있는 작은 조각 */
export function Chip({ selected, onClick, onRemove, icon, disabled, className, children }: ChipProps) {
  const interactive = Boolean(onClick);

  const content = (
    <>
      {icon}
      {children}
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label="삭제"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/5"
        >
          <X aria-hidden className="size-3" />
        </span>
      )}
    </>
  );

  const className_ = cn(
    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-caption transition-colors',
    selected
      ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
      : 'border-ink-300 bg-surface text-ink-700',
    interactive && !disabled && 'cursor-pointer hover:border-ink-500',
    disabled && 'cursor-not-allowed opacity-50',
    className,
  );

  if (!interactive) {
    return <span className={className_}>{content}</span>;
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={className_}
    >
      {content}
    </button>
  );
}
