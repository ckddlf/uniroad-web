import type { Metadata } from 'next';

import { VerificationPanel } from '@/features/verification/ui/VerificationPanel';

export const metadata: Metadata = { title: '교환학생 인증' };
export const dynamic = 'force-dynamic';

export default function VerificationPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-h1 text-ink-900">교환학생 인증</h1>
        <p className="text-body text-ink-500">
          파견이 확인되면 거래와 동행 기능이 열려요.
        </p>
      </header>

      <VerificationPanel />
    </div>
  );
}
