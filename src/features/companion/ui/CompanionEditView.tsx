'use client';

import Link from 'next/link';

import { useAuthStore } from '@/shared/store/authStore';
import { buttonClass, EmptyState, ErrorState, Skeleton } from '@/shared/ui';

import { useCompanion } from '../api';
import { CompanionForm } from './CompanionForm';

export function CompanionEditView({ postId }: { postId: number }) {
  const post = useCompanion(postId);
  const myId = useAuthStore((state) => state.member?.id);

  if (post.isPending) return <Skeleton className="h-96 w-full" />;
  if (post.isError) return <ErrorState error={post.error} onRetry={() => void post.refetch()} />;

  if (myId === undefined || post.data.memberId !== myId) {
    return (
      <EmptyState
        title="수정할 수 없는 글이에요"
        description="내가 올린 모집글만 수정할 수 있어요."
        action={
          <Link href={`/companions/${postId}`} className={buttonClass()}>
            모집글로 돌아가기
          </Link>
        }
      />
    );
  }

  return <CompanionForm postId={postId} initial={post.data} />;
}
