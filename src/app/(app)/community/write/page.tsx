import type { Metadata } from 'next';

import { PostForm } from '@/features/community/ui/PostForm';

export const metadata: Metadata = { title: '글쓰기' };
export const dynamic = 'force-dynamic';

export default function CommunityWritePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-h1 text-ink-900">글쓰기</h1>
      <PostForm />
    </div>
  );
}
