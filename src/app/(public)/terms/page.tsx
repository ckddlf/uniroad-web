import type { Metadata } from 'next';

import { LEGAL_DOCUMENTS } from '@/entities/legal/documents';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

export const metadata: Metadata = {
  title: '이용약관 · 개인정보처리방침',
  description: 'UIROAD 이용약관과 개인정보 처리방침입니다.',
};

export default function TermsPage() {
  return (
    <>
      <LandingHeader />

      <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
        {LEGAL_DOCUMENTS.map((document) => (
          <section key={document.key} id={document.key} className="flex flex-col gap-4">
            <h1 className="text-h1 text-ink-900">{document.title}</h1>
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
