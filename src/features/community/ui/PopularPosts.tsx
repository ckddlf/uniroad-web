'use client';

import Link from 'next/link';
import { Flame, Heart, MessageCircle } from 'lucide-react';

import { formatNumber } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';

import { usePopularPosts } from '../api';

/** 목록 상단에 고정되는 인기글 Top 3 */
export function PopularPosts() {
  const popular = usePopularPosts();

  if (popular.isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  // 인기글은 보조 정보라 실패하면 조용히 접는다 (목록은 그대로 보여야 한다)
  if (popular.isError || popular.data.length === 0) return null;

  return (
    <section aria-labelledby="popular-heading" className="flex flex-col gap-3">
      <h2 id="popular-heading" className="inline-flex items-center gap-1.5 text-label font-medium text-ink-700">
        <Flame aria-hidden className="size-4 text-warning" />
        인기글
      </h2>

      <ul className="grid gap-3 sm:grid-cols-3">
        {popular.data.slice(0, 3).map((post) => (
          <li key={post.id}>
            <Link
              href={`/community/${post.id}`}
              className="flex h-full flex-col gap-2 rounded-lg border border-ink-100 bg-surface p-4 transition-colors hover:border-ink-300"
            >
              <h3 className="line-clamp-2-safe text-body font-medium text-ink-900">{post.title}</h3>
              <p className="line-clamp-2-safe text-caption text-ink-500">{post.preview}</p>

              <div className="mt-auto flex items-center gap-3 pt-1 text-caption text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <Heart aria-hidden className="size-3.5" />
                  {formatNumber(post.likeCount)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle aria-hidden className="size-3.5" />
                  {formatNumber(post.commentCount)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
