import { Suspense } from 'react';
import type { Metadata } from 'next';

import { CommunityView } from '@/features/community/ui/CommunityView';
import { Skeleton } from '@/shared/ui';

export const metadata: Metadata = { title: '커뮤니티' };
export const dynamic = 'force-dynamic';

export default function CommunityPage() {
  return (
    // 탭·검색어를 useSearchParams로 읽으므로 Suspense 경계가 필요하다
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CommunityView />
    </Suspense>
  );
}
