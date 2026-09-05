import type { Metadata } from 'next';

import { FaqList } from '@/widgets/landing/FaqList';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

export const metadata: Metadata = {
  title: '자주 묻는 질문',
  description: '가입·온보딩·인증·기능 이용에서 자주 나오는 질문을 모았습니다.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <>
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
