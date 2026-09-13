import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { NoticeResponse } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/date';
import { OG_DEFAULTS, shareImages } from '@/shared/lib/site';
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

/** 블로그와 같은 이유로 미리 구워둔다 */
export async function generateStaticParams() {
  const notices = await fetchPublic<NoticeResponse[]>(endpoints.notice.list, 3600);
  return (notices ?? []).map((notice) => ({ noticeId: String(notice.id) }));
}

/** 공지 본문에는 태그가 섞여 있다. 설명에 <p>가 그대로 나가면 검색결과에 태그가 보인다. */
function toDescription(content: string): string {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length <= 120 ? text : `${text.slice(0, 120).trimEnd()}…`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { noticeId } = await params;
  const notice = await loadNotice(noticeId);

  if (notice === null) {
    return { title: '공지사항', robots: { index: false, follow: true } };
  }

  const description = toDescription(notice.content);

  return {
    title: notice.title,
    description,
    alternates: { canonical: `/notices/${notice.id}` },
    openGraph: {
      ...OG_DEFAULTS,
      type: 'article',
      title: notice.title,
      description,
      url: `/notices/${notice.id}`,
      publishedTime: notice.createdAt,
      modifiedTime: notice.updatedAt,
      ...shareImages(null),
    },
  };
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
