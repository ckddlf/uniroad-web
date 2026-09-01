import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

/**
 * 랜딩에서 서비스 화면을 설명하려고 그리는 도식(스크린샷이 아니다).
 * 히어로와 기능 상세가 같은 부품을 써서 화면 예시의 생김새를 하나로 맞춘다.
 */
export function MockPanel({
  title,
  trailing,
  className,
  children,
}: {
  title?: string;
  trailing?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('rounded-lg border border-ink-100 bg-surface p-5 shadow-card', className)}>
      {title && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-label text-ink-700">{title}</p>
          {trailing && <p className="text-caption text-ink-500">{trailing}</p>}
        </div>
      )}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function MockRow({
  label,
  trailing,
  checked,
  icon,
  emphasis,
}: {
  label: string;
  trailing?: string;
  /** 값을 넘기면 체크박스가 붙는다 */
  checked?: boolean;
  icon?: ReactNode;
  /** 목록에서 눈에 먼저 들어와야 하는 줄 */
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-canvas px-3.5 py-2.5">
      {icon ? (
        <span aria-hidden className="shrink-0 text-brand-600">
          {icon}
        </span>
      ) : checked === undefined ? (
        /* 아이콘도 체크박스도 없는 줄은 자리만 비워 다른 줄과 글머리를 맞춘다 */
        <span aria-hidden className="size-4 shrink-0" />
      ) : (
        <span
          aria-hidden
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded-sm border',
            checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-300 bg-surface',
          )}
        >
          {checked && <Check className="size-3" strokeWidth={3} />}
        </span>
      )}

      <span
        className={cn(
          'min-w-0 flex-1 truncate text-caption',
          emphasis ? 'font-medium text-ink-900' : 'text-ink-700',
        )}
      >
        {label}
      </span>

      {trailing && (
        <span className="shrink-0 text-caption font-medium text-brand-600">{trailing}</span>
      )}
    </div>
  );
}
