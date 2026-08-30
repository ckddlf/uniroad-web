'use client';

import Link from 'next/link';
import { Luggage } from 'lucide-react';

import { useCompanionList } from '@/features/companion/api';
import { formatDate } from '@/shared/lib/date';
import { Skeleton } from '@/shared/ui';

import { WidgetCard } from './WidgetCard';

export function CompanionWidget() {
  const list = useCompanionList({ status: 'RECRUITING' });
  const items = list.items.slice(0, 3);

  return (
    <WidgetCard
      title="모집 중인 동행"
      icon={<Luggage aria-hidden className="size-5 text-ink-500" />}
      href="/companions"
    >
      {list.isPending && <Skeleton className="h-24 w-full" />}
      {list.isError && <p className="text-body text-ink-500">동행 글을 불러오지 못했어요.</p>}

      {!list.isPending && !list.isError && items.length === 0 && (
        <p className="text-body text-ink-500">지금 모집 중인 동행이 없어요.</p>
      )}

      {items.length > 0 && (
        <ul className="flex flex-col divide-y divide-ink-100">
          {items.map((post) => (
            <li key={post.id}>
              <Link
                href={`/companions/${post.id}`}
                className="flex flex-col gap-0.5 py-2.5 transition-colors hover:text-brand-700"
              >
                <span className="truncate text-body text-ink-900">{post.title}</span>
                <span className="text-caption text-ink-500">
                  {[post.country, post.region].filter(Boolean).join(' ')} ·{' '}
                  {formatDate(post.startDate, 'M월 d일')} · {post.currentParticipants}/
                  {post.capacity}명
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
