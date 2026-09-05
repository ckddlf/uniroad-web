'use client';

import { useState } from 'react';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { toErrorMessage } from '@/shared/api/errors';
import type { BlogPostSummaryResponse, CursorPage } from '@/shared/api/types';
import { Button, useToast } from '@/shared/ui';

import { BlogCard } from './BlogCard';

export interface BlogMorePostsProps {
  /** 서버가 이미 그린 첫 페이지의 마지막 지점 */
  initialCursor: number;
  size?: number;
}

/**
 * 첫 페이지는 서버 컴포넌트가 그린다(검색 노출을 위해서다).
 * 이 컴포넌트는 그 아래에 붙어 두 번째 페이지부터만 이어 붙인다.
 */
export function BlogMorePosts({ initialCursor, size = 9 }: BlogMorePostsProps) {
  const toast = useToast();
  const [items, setItems] = useState<BlogPostSummaryResponse[]>([]);
  const [cursor, setCursor] = useState<number | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (cursor === null || loading) return;

    setLoading(true);
    try {
      const page = await get<CursorPage<BlogPostSummaryResponse>>(endpoints.blog.list, {
        cursorId: cursor,
        size,
      });
      setItems((previous) => [...previous, ...page.items]);
      setCursor(page.hasNext ? page.nextCursorId : null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {items.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <BlogCard key={post.id} post={post} href={`/blog/${post.slug}`} />
          ))}
        </div>
      )}

      {cursor !== null && (
        <div className="mt-10 flex justify-center">
          <Button variant="secondary" size="lg" onClick={() => void loadMore()} loading={loading}>
            글 더 보기
          </Button>
        </div>
      )}
    </>
  );
}
