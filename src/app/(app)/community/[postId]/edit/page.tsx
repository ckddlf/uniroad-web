import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostEditView } from '@/features/community/ui/PostEditView';

export const metadata: Metadata = { title: '글 수정' };
export const dynamic = 'force-dynamic';

export default async function CommunityEditPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const id = Number(postId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-h1 text-ink-900">글 수정</h1>
      <PostEditView postId={id} />
    </div>
  );
}
