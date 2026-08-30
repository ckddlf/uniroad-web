import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type BadgeTone = 'neutral' | 'brand' | 'danger' | 'warning' | 'info' | 'purple';

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-50 text-brand-700',
  danger: 'bg-danger-bg text-danger',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  purple: 'bg-[#F3EEFB] text-[#6B46C1]',
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** 상태·속성을 나타내는 읽기 전용 라벨 */
export function Badge({ tone = 'neutral', icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium whitespace-nowrap',
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
