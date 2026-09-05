'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/shared/store/authStore';
import { useToast } from '@/shared/ui/Toast';

import { useBlogLike } from '../api';

export interface BlogLikeButtonProps {
  postId: number;
  slug: string;
  initialLiked: boolean;
  initialCount: number;
}

export function BlogLikeButton({ postId, slug, initialLiked, initialCount }: BlogLikeButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const accessToken = useAuthStore((state) => state.accessToken);
  const like = useBlogLike(slug);

  // 서버 응답을 기다리지 않고 먼저 반영한다. 실패하면 아래 catch에서 되돌린다.
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggle = () => {
    if (accessToken === null) {
      toast.error('로그인이 필요해요.');
      router.push(`/login?redirectTo=${encodeURIComponent(`/blog/${slug}`)}`);
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((previous) => previous + (nextLiked ? 1 : -1));

    like.mutate(postId, {
      onSuccess: (result) => {
        setLiked(result.liked);
        setCount(result.likeCount);
      },
      onError: (error) => {
        setLiked(liked);
        setCount(count);
        toast.error(toErrorMessage(error));
      },
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-body transition-colors',
        liked
          ? 'border-brand-500 bg-brand-50 text-brand-700'
          : 'border-ink-300 bg-surface text-ink-700 hover:bg-ink-100',
      )}
    >
      <Heart aria-hidden className={cn('size-4', liked && 'fill-current')} />
      {count}
    </button>
  );
}
