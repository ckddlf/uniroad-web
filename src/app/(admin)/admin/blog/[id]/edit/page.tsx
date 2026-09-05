'use client';

import { use } from 'react';

import { useAdminBlogPost } from '@/features/blog/api';
import { BlogPostForm } from '@/features/blog/ui/BlogPostForm';
import { ErrorState, Skeleton } from '@/shared/ui';

export default function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = Number(id);
  const post = useAdminBlogPost(postId);

  if (post.isPending) return <Skeleton className="h-[40rem] w-full" />;
  if (post.isError) return <ErrorState error={post.error} onRetry={() => void post.refetch()} />;

  return <BlogPostForm post={post.data} />;
}
