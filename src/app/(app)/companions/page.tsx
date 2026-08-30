import { Suspense } from 'react';
import type { Metadata } from 'next';

import { CompanionsView } from '@/features/companion/ui/CompanionsView';
import { Skeleton } from '@/shared/ui';

export const metadata: Metadata = { title: '동행 구하기' };
export const dynamic = 'force-dynamic';

export default function CompanionsPage() {
  return (
    // 필터를 useSearchParams로 읽으므로 Suspense 경계가 필요하다
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CompanionsView />
    </Suspense>
  );
}
