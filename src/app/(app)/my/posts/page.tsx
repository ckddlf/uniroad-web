import type { Metadata } from 'next';

import { MyContentTabs } from '@/features/my/ui/MyContentTabs';

export const metadata: Metadata = { title: '내가 쓴 글' };
export const dynamic = 'force-dynamic';

export default function MyPostsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">내가 쓴 글</h1>
      <MyContentTabs scope="my" />
    </div>
  );
}
