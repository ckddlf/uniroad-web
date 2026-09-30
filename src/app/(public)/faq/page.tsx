import type { Metadata } from 'next';

import { FAQ_ITEMS } from '@/entities/faq/items';
import { breadcrumbSchema, faqSchema } from '@/shared/lib/jsonLd';
import { pageMetadata } from '@/shared/lib/site';
import { JsonLd } from '@/shared/ui';
import { FaqList } from '@/widgets/landing/FaqList';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

export const metadata: Metadata = pageMetadata({
  title: '자주 묻는 질문 — 가입·교환학생 인증·이용 안내',
  description:
    '교환학생 커뮤니티 UNIROAD의 가입과 온보딩, 교환학생 인증 서류와 심사 기간, 준비 일정 체크리스트, 중고거래·티켓 양도 이용 방법을 질문과 답으로 정리했습니다.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      {/* 질문·답변을 그대로 알려주면 검색결과에 아코디언으로 펼쳐진다 */}
      <JsonLd data={faqSchema(FAQ_ITEMS)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '자주 묻는 질문', path: '/faq' },
        ])}
      />
      <LandingHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 break-keep px-6 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-h1 text-ink-900">자주 묻는 질문</h1>
          <p className="text-body text-ink-500">궁금한 것을 카테고리별로 확인해 보세요.</p>
        </div>

        <div className="mt-8">
          <FaqList />
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
