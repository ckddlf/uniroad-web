'use client';

import Link from 'next/link';

import { formatNumber } from '@/shared/lib/format';
import { ErrorState, Skeleton } from '@/shared/ui';

import { useAdminDashboard } from '../api';

export function AdminDashboard() {
  const dashboard = useAdminDashboard();

  if (dashboard.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (dashboard.isError) {
    return <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />;
  }

  const data = dashboard.data;

  const cards = [
    { label: '총 회원', value: data.totalMembers },
    { label: '오늘 가입', value: data.todaySignups },
    { label: '총 게시글', value: data.totalPosts },
    { label: '대기 중인 인증', value: data.pendingVerifications, href: '/admin/verifications' },
    { label: '전체 신고', value: data.reportCount, href: '/admin/reports' },
    { label: '처리 대기 신고', value: data.pendingReportCount, href: '/admin/reports' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const body = (
            <>
              <p className="text-caption text-ink-500">{card.label}</p>
              <p className="mt-2 text-display text-ink-900">{formatNumber(card.value)}</p>
            </>
          );

          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-lg border border-ink-100 bg-surface p-5 transition-colors hover:border-ink-300"
            >
              {body}
            </Link>
          ) : (
            <div key={card.label} className="rounded-lg border border-ink-100 bg-surface p-5">
              {body}
            </div>
          );
        })}
      </div>

      <section className="rounded-lg border border-ink-100 bg-surface p-5">
        <h2 className="text-h2 text-ink-900">지금 처리할 것</h2>

        <ul className="mt-4 flex flex-col gap-2">
          <li>
            <Link href="/admin/verifications" className="text-body text-brand-600 hover:underline">
              인증 심사 대기 {formatNumber(data.pendingVerifications)}건 →
            </Link>
          </li>
          <li>
            <Link href="/admin/reports" className="text-body text-brand-600 hover:underline">
              미처리 신고 {formatNumber(data.pendingReportCount)}건 →
            </Link>
          </li>
        </ul>

        <p className="mt-4 text-caption text-ink-500">
          처리 완료된 신고 {formatNumber(data.resolvedReportCount)}건.
        </p>
      </section>
    </div>
  );
}
