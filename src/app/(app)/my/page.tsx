import type { Metadata } from 'next';

import { MyProfileSummary } from '@/features/my/ui/MyProfileSummary';

export const metadata: Metadata = { title: '마이페이지' };
export const dynamic = 'force-dynamic';

export default function MyPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">내 정보</h1>
      <MyProfileSummary />
    </div>
  );
}
