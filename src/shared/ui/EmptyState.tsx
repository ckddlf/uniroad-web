import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** 빈 화면에서 이어질 다음 행동 */
  action?: ReactNode;
  className?: string;
}

/** 모든 목록 화면은 로딩·빈 상태·에러 3종을 반드시 갖춘다 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ink-300 bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      {icon && <div className="text-ink-300">{icon}</div>}
      <p className="text-h2 text-ink-900">{title}</p>
      {description && <p className="max-w-md text-body text-ink-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
