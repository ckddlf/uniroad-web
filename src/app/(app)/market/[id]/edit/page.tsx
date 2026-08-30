import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { UsedItemEditView } from '@/features/market/ui/UsedItemEditView';

export const metadata: Metadata = { title: '판매글 수정' };
export const dynamic = 'force-dynamic';

export default async function MarketEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId) || itemId <= 0) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-h1 text-ink-900">판매글 수정</h1>
      <UsedItemEditView itemId={itemId} />
    </div>
  );
}
