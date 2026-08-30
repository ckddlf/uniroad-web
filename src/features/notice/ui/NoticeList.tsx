'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { NoticeResponse } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/date';
import { EmptyState, Pagination } from '@/shared/ui';

const PAGE_SIZE = 20;

/**
 * 공지 목록 API에는 페이징이 없어 전체 배열이 온다.
 * 건수가 늘어날 것을 대비해 화면에서 20개씩 나눠 보여준다.
 */
export function NoticeList({ notices }: { notices: NoticeResponse[] }) {
  const [page, setPage] = useState(0);

  if (notices.length === 0) {
    return <EmptyState className="mt-8" title="아직 등록된 공지가 없어요" />;
  }

  const totalPages = Math.ceil(notices.length / PAGE_SIZE);
  const visible = notices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <ul className="flex flex-col divide-y divide-ink-100 border-t border-ink-100">
        {visible.map((notice) => (
          <li key={notice.id}>
            <Link
              href={`/notices/${notice.id}`}
              className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-brand-700"
            >
              <span className="truncate text-body text-ink-900">{notice.title}</span>
              <span className="shrink-0 text-caption text-ink-500">
                {formatDate(notice.createdAt, 'yyyy. M. d.')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
