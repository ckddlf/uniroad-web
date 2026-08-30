import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { NoticeResponse } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/date';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

interface PageProps {
  params: Promise<{ noticeId: string }>;
}

async function loadNotice(noticeId: string): Promise<NoticeResponse | null> {
  const id = Number(noticeId);
  if (!Number.isInteger(id)) return null;

  return fetchPublic<NoticeResponse>(endpoints.notice.detail(id), 60);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { noticeId } = await params;
  const notice = await loadNotice(noticeId);

  return notice ? { title: notice.title, description: notice.content.slice(0, 120) } : { title: '공지사항' };
}

export default async function NoticeDetailPage({ params }: PageProps) {
  const { noticeId } = await params;
  const notice = await loadNotice(noticeId);

  if (!notice) notFound();

  return (
    <>
      <LandingHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          href="/notices"
          className="inline-flex items-center gap-1 text-caption text-ink-500 hover:text-ink-900"
        >
          <ChevronLeft aria-hidden className="size-4" />
          공지사항
        </Link>

        <h1 className="mt-4 text-h1 text-ink-900">{notice.title}</h1>
        <p className="mt-2 text-caption text-ink-500">{formatDate(notice.createdAt)}</p>

        <div className="mt-8 border-t border-ink-100 pt-8 text-body whitespace-pre-wrap text-ink-700">
          {notice.content}
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
