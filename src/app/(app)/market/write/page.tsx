import type { Metadata } from 'next';

import { UsedItemForm } from '@/features/market/ui/UsedItemForm';

export const metadata: Metadata = { title: '판매글 등록' };
export const dynamic = 'force-dynamic';

export default function MarketWritePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-h1 text-ink-900">판매글 등록</h1>
        <p className="mt-1 text-body text-ink-500">
          품목과 사진을 카테고리로 나눠 적으면 훨씬 빨리 연락이 와요.
        </p>
      </header>

      <UsedItemForm />
    </div>
  );
}
