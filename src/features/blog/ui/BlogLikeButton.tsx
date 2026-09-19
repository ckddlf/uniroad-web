'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/shared/store/authStore';
import { useToast } from '@/shared/ui/Toast';

import { useBlogLike, useBlogPost } from '../api';

export interface BlogLikeButtonProps {
  postId: number;
  slug: string;
  initialLiked: boolean;
  initialCount: number;
}

export function BlogLikeButton({ postId, slug, initialLiked, initialCount }: BlogLikeButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const phase = useAuthStore((state) => state.phase);
  const accessToken = useAuthStore((state) => state.accessToken);
  const like = useBlogLike(slug);

  // 서버 응답을 기다리지 않고 먼저 반영한다. 실패하면 아래 catch에서 되돌린다.
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  /**
   * 상세 페이지는 검색 노출을 위해 서버에서 그리는데, 그 요청에는 토큰이 실리지 않고
   * 응답이 캐시까지 된다(shared/api/server.ts). 그래서 initialLiked는 누구에게나 false다.
   * 로그인한 사람에게는 마운트 뒤 본인 기준으로 한 번 더 받아 하트를 맞춘다.
   */
  const signedIn = phase === 'ready' && accessToken !== null;
  const fresh = useBlogPost(slug, signedIn);

  // 누른 뒤에는 화면이 앞서 있으므로 덮어쓰지 않는다
  const pressed = useRef(false);

  useEffect(() => {
    if (pressed.current || fresh.data === undefined) return;
    setLiked(fresh.data.likedByMe);
    setCount(fresh.data.likeCount);
  }, [fresh.data]);

  const toggle = () => {
    // 세션 복원이 끝나기 전에는 로그인 여부를 알 수 없다.
    // 여기서 accessToken만 보면 로그인한 사람을 /login으로 튕긴다.
    if (phase !== 'ready') return;

    if (accessToken === null) {
      toast.error('로그인이 필요해요.');
      router.push(`/login?redirectTo=${encodeURIComponent(`/blog/${slug}`)}`);
      return;
    }

    pressed.current = true;
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
