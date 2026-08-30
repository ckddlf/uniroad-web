import type { Metadata } from 'next';

import { AccountBookView } from '@/features/account-book/ui/AccountBookView';

export const metadata: Metadata = { title: '가계부' };
export const dynamic = 'force-dynamic';

export default function AccountBookPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-h1 text-ink-900">가계부</h1>
        <p className="mt-1 text-body text-ink-500">현지 생활비를 하루 단위로 기록해보세요.</p>
      </header>

      <AccountBookView />
    </div>
  );
}
