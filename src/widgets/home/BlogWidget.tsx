'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { useBlogPosts } from '@/features/blog/api';
import { BlogCard } from '@/features/blog/ui/BlogCard';
import { Skeleton } from '@/shared/ui';

import { WidgetCard } from './WidgetCard';

/** 한 줄에 놓는 카드 수(넓은 화면 기준). 이보다 많으면 목록으로 보내고 여기서는 더 늘리지 않는다. */
const ROW_SIZE = 3;

/**
 * 홈에서 보여 주는 블로그 글.
 *
 * 목록과 같은 BlogCard를 그대로 쓴다. 홈 전용 카드를 따로 만들면 같은 글이 두 화면에서
 * 다르게 보이고, 한쪽만 고쳐지는 일이 생긴다.
 *
 * 한 줄까지만 깔고 그 아래는 "전체 보기"로 넘긴다 — 홈은 어디로 갈지 고르는 곳이지
 * 글을 읽는 곳이 아니다.
 */
export function BlogWidget() {
  // 한 줄보다 하나 더 받아 본다. 더 있는지 알아야 "더 보기"를 띄울지 정할 수 있다.
  const query = useBlogPosts(ROW_SIZE + 1);

  const posts = query.data?.items ?? [];
  const shown = posts.slice(0, ROW_SIZE);
  const hasMore = posts.length > ROW_SIZE || (query.data?.hasNext ?? false);

  return (
    <WidgetCard
      title="블로그"
      icon={<BookOpen aria-hidden className="size-5 text-ink-500" />}
      href="/blog"
    >
      {query.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="aspect-[16/10] w-full" />
          ))}
        </div>
      )}

      {query.isError && <p className="text-body text-ink-500">글을 불러오지 못했어요.</p>}

      {!query.isPending && !query.isError && shown.length === 0 && (
        <p className="text-body text-ink-500">아직 올라온 글이 없어요.</p>
      )}

      {shown.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((post) => (
              <BlogCard key={post.id} post={post} href={`/blog/${post.slug}`} />
            ))}
          </div>

          {hasMore && (
            <Link
              href="/blog"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-ink-300 py-2.5 text-body text-ink-700 transition-colors hover:bg-ink-100"
            >
              블로그 글 전체 보기 →
            </Link>
          )}
        </>
      )}
    </WidgetCard>
  );
}
