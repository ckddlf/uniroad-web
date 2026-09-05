import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { FAQ_ITEMS, FAQ_PREVIEW_COUNT } from '@/entities/faq/items';
import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { NoticeResponse } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/date';

import { Card, Section, SectionHeading } from './Section';

/** 공지는 인증 없이 열리는 엔드포인트라 서버에서 미리 받아 정적으로 내보낸다 */
export async function NoticeAndFaq() {
  const notices = await fetchPublic<NoticeResponse[]>(endpoints.notice.list);
  const recent = Array.isArray(notices) ? notices.slice(0, 4) : [];
  const faq = FAQ_ITEMS.slice(0, FAQ_PREVIEW_COUNT);

  return (
    <Section id="faq" tone="surface">
      <SectionHeading
        eyebrow="Notice & FAQ"
        title="시작하기 전에 궁금한 것들"
        description="가입 전에 자주 나오는 질문과 최근 공지를 모았습니다."
      />

      <div className="mt-12 grid items-start gap-5 sm:mt-14 lg:grid-cols-[1fr_1.15fr]">
        <Card tone="canvas" className="flex flex-col">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-h2 text-ink-900">공지사항</h3>
            <Link
              href="/notices"
              className="text-caption font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              전체 보기
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-6 text-body text-ink-500">아직 등록된 공지가 없어요.</p>
          ) : (
            <ul className="mt-2 flex flex-col divide-y divide-ink-100">
              {recent.map((notice) => (
                <li key={notice.id}>
                  <Link
                    href={`/notices/${notice.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:text-brand-700"
                  >
                    <span className="truncate text-body text-ink-900">{notice.title}</span>
                    <span className="shrink-0 text-caption text-ink-500">
                      {formatDate(notice.createdAt, 'yyyy. M. d.')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card tone="canvas">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-h2 text-ink-900">자주 묻는 질문</h3>
            <Link
              href="/faq"
              className="text-caption font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              전체 보기
            </Link>
          </div>

          <div className="mt-2 flex flex-col divide-y divide-ink-100">
            {faq.map((item) => (
              <details key={item.question} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body font-medium text-ink-900">
                  {item.question}
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-ink-500 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 text-body text-ink-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
