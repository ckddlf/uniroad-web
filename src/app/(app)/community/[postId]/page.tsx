import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostDetailView } from '@/features/community/ui/PostDetailView';

export const metadata: Metadata = { title: '게시글' };
export const dynamic = 'force-dynamic';

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const id = Number(postId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PostDetailView postId={id} />
    </div>
  );
}
