import { Suspense } from 'react';
import type { Metadata } from 'next';

import { TicketsView } from '@/features/ticket/ui/TicketsView';
import { Skeleton } from '@/shared/ui';

export const metadata: Metadata = { title: '티켓 양도' };
export const dynamic = 'force-dynamic';

export default function TicketsPage() {
  return (
    // 필터를 useSearchParams로 읽으므로 Suspense 경계가 필요하다
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <TicketsView />
    </Suspense>
  );
}
