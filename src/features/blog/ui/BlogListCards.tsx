'use client';

import type { BlogPostSummaryResponse } from '@/shared/api/types';
import { useAuthStore } from '@/shared/store/authStore';

import { useBlogLikeStates } from '../api';
import { BlogCard } from './BlogCard';

export interface BlogListCardsProps {
  /** 서버가 이미 그린 첫 페이지 — 크롤러가 보는 것도 이 목록이다 */
  posts: BlogPostSummaryResponse[];
}

/**
 * 목록 첫 페이지.
 *
 * 카드 자체는 서버가 그린 값 그대로 두고, 로그인한 사람에게만 하트와 숫자를 본인 기준으로
 * 바꿔 끼운다. 서버 렌더는 토큰 없이 돌아 likedByMe가 늘 false이기 때문이다(useBlogLikeStates).
 */
export function BlogListCards({ posts }: BlogListCardsProps) {
  const phase = useAuthStore((state) => state.phase);
  const accessToken = useAuthStore((state) => state.accessToken);

  const likeStates = useBlogLikeStates(posts.length, phase === 'ready' && accessToken !== null);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const mine = likeStates.get(post.id);
        return (
          <BlogCard
            key={post.id}
            post={mine === undefined ? post : { ...post, ...mine }}
            href={`/blog/${post.slug}`}
          />
        );
      })}
    </div>
  );
}
