'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

export interface WidgetCardProps {
  title: string;
  icon?: ReactNode;
  /** 오른쪽 위 "전체 보기" 링크 */
  href?: string;
  actionLabel?: string;
  className?: string;
  children: ReactNode;
}

/** 홈 대시보드 위젯 공통 껍데기. 위젯마다 독립적으로 실패를 가둔다. */
export function WidgetCard({
  title,
  icon,
  href,
  actionLabel = '전체 보기',
  className,
  children,
}: WidgetCardProps) {
  return (
    <ErrorBoundary
      fallback={
        <section className={cn('rounded-lg border border-ink-100 bg-surface p-5', className)}>
          <h2 className="text-h2 text-ink-900">{title}</h2>
          <p className="mt-3 text-body text-ink-500">이 영역을 불러오지 못했어요.</p>
        </section>
      }
    >
      <section className={cn('flex flex-col rounded-lg border border-ink-100 bg-surface p-5', className)}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="inline-flex items-center gap-2 text-h2 text-ink-900">
            {icon}
            {title}
          </h2>

          {href && (
            <Link href={href} className="shrink-0 text-caption font-medium text-brand-600 hover:underline">
              {actionLabel} →
            </Link>
          )}
        </div>

        {children}
      </section>
    </ErrorBoundary>
  );
}
