import { Suspense } from 'react';
import type { Metadata } from 'next';

import { MarketView } from '@/features/market/ui/MarketView';
import { Skeleton } from '@/shared/ui';

export const metadata: Metadata = { title: '중고거래' };
export const dynamic = 'force-dynamic';

export default function MarketPage() {
  return (
    // 필터를 useSearchParams로 읽으므로 Suspense 경계가 필요하다
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <MarketView />
    </Suspense>
  );
}
