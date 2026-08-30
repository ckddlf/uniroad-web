'use client';

import Link from 'next/link';
import { Flame, Heart, MessageCircle } from 'lucide-react';

import { usePopularPosts } from '@/features/community/api';
import { formatNumber } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';

import { WidgetCard } from './WidgetCard';

export function PopularPostsWidget() {
  const popular = usePopularPosts();

  return (
    <WidgetCard
      title="인기글"
      icon={<Flame aria-hidden className="size-5 text-warning" />}
      href="/community"
    >
      {popular.isPending && <Skeleton className="h-24 w-full" />}
      {popular.isError && <p className="text-body text-ink-500">인기글을 불러오지 못했어요.</p>}

      {popular.isSuccess &&
        (popular.data.length === 0 ? (
          <p className="text-body text-ink-500">아직 글이 없어요. 첫 글을 남겨보세요.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-ink-100">
            {popular.data.slice(0, 3).map((post, index) => (
              <li key={post.id}>
                <Link
                  href={`/community/${post.id}`}
                  className="flex items-center gap-3 py-2.5 transition-colors hover:text-brand-700"
                >
                  <span className="text-body font-medium text-ink-300">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-body text-ink-900">{post.title}</span>

                  <span className="flex shrink-0 items-center gap-2 text-caption text-ink-500">
                    <span className="inline-flex items-center gap-0.5">
                      <Heart aria-hidden className="size-3.5" />
                      {formatNumber(post.likeCount)}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MessageCircle aria-hidden className="size-3.5" />
                      {formatNumber(post.commentCount)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ))}
    </WidgetCard>
  );
}
