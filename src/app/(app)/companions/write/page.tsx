import type { Metadata } from 'next';

import { CompanionForm } from '@/features/companion/ui/CompanionForm';

export const metadata: Metadata = { title: '동행 등록' };
export const dynamic = 'force-dynamic';

export default function CompanionWritePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-h1 text-ink-900">동행 등록</h1>
        <p className="mt-1 text-body text-ink-500">
          참여 연락은 카카오톡 오픈채팅으로 이어집니다.
        </p>
      </header>

      <CompanionForm />
    </div>
  );
}
