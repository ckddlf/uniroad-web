import type { Metadata } from 'next';

import { LEGAL_DOCUMENTS } from '@/entities/legal/documents';
import { pageMetadata } from '@/shared/lib/site';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

export const metadata: Metadata = pageMetadata({
  title: '이용약관 · 개인정보처리방침',
  description:
    '교환학생 커뮤니티 UNIROAD의 이용약관과 개인정보 처리방침입니다. 회원 간 거래·동행의 책임 범위, 수집하는 개인정보와 이용 목적, 인증 서류 열람 기준을 안내합니다.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <LandingHeader />

      <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
        {/* 문서가 둘이라 페이지 제목(h1)은 하나로 두고, 각 문서 제목은 h2로 내린다. 모양은 클래스가 정한다 */}
        <h1 className="sr-only">이용약관 · 개인정보처리방침</h1>
        {LEGAL_DOCUMENTS.map((document) => (
          <section key={document.key} id={document.key} className="flex flex-col gap-4">
            <h2 className="text-h1 text-ink-900">{document.title}</h2>
            {document.body.map((paragraph) => (
              <p key={paragraph} className="text-body text-ink-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </main>

      <LandingFooter />
    </>
  );
}
