'use client';

import Link from 'next/link';

import { buttonClass, EmptyState, ErrorState, Skeleton } from '@/shared/ui';

import { useFreePost } from '../api';
import { PostForm } from './PostForm';

/** 수정은 작성자 본인만 가능하다 (`mine` 플래그로 판단) */
export function PostEditView({ postId }: { postId: number }) {
  const post = useFreePost(postId);

  if (post.isPending) return <Skeleton className="h-96 w-full" />;
  if (post.isError) return <ErrorState error={post.error} onRetry={() => void post.refetch()} />;

  if (!post.data.mine) {
    return (
      <EmptyState
        title="수정할 수 없는 글이에요"
        description="내가 쓴 글만 수정할 수 있어요."
        action={
          <Link href={`/community/${postId}`} className={buttonClass()}>
            글로 돌아가기
          </Link>
        }
      />
    );
  }

  return (
    <PostForm
      postId={postId}
      initial={{
        title: post.data.title,
        content: post.data.content,
        imageUrls: post.data.imageUrls ?? [],
      }}
    />
  );
}
