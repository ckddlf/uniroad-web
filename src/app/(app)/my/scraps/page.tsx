import type { Metadata } from 'next';

import { MyContentTabs } from '@/features/my/ui/MyContentTabs';

export const metadata: Metadata = { title: '스크랩' };
export const dynamic = 'force-dynamic';

export default function MyScrapsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">스크랩</h1>
      <MyContentTabs scope="scraps" />
    </div>
  );
}
