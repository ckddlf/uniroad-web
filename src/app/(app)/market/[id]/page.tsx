import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { UsedItemDetailView } from '@/features/market/ui/UsedItemDetailView';

export const metadata: Metadata = { title: '중고거래' };
export const dynamic = 'force-dynamic';

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId) || itemId <= 0) notFound();

  return <UsedItemDetailView itemId={itemId} />;
}
