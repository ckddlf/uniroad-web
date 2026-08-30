'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Megaphone } from 'lucide-react';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { NoticeResponse } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/date';
import { Skeleton } from '@/shared/ui';

import { WidgetCard } from './WidgetCard';

export function NoticeWidget() {
  const notices = useQuery({
    queryKey: queryKeys.notice.list(),
    queryFn: () => get<NoticeResponse[]>(endpoints.notice.list),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <WidgetCard
      title="공지사항"
      icon={<Megaphone aria-hidden className="size-5 text-ink-500" />}
      href="/notices"
    >
      {notices.isPending && <Skeleton className="h-20 w-full" />}
      {notices.isError && <p className="text-body text-ink-500">공지를 불러오지 못했어요.</p>}

      {notices.isSuccess &&
        (notices.data.length === 0 ? (
          <p className="text-body text-ink-500">등록된 공지가 없어요.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100">
            {notices.data.slice(0, 3).map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-brand-700"
                >
                  <span className="truncate text-body text-ink-900">{notice.title}</span>
                  <span className="shrink-0 text-caption text-ink-500">
                    {formatDate(notice.createdAt, 'M. d.')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </WidgetCard>
  );
}
