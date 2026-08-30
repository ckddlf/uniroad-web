'use client';

import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';

import type { CursorPage } from '@/shared/api/types';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/constants';

export interface CursorPageParams {
  cursorId?: number;
  size: number;
}

export interface UseCursorInfiniteOptions<T> {
  queryKey: QueryKey;
  fetchPage: (params: CursorPageParams) => Promise<CursorPage<T>>;
  size?: number;
  enabled?: boolean;
}

export interface UseCursorInfiniteResult<T> {
  items: T[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  isEmpty: boolean;
  hasNext: boolean;
  isFetchingNext: boolean;
  fetchNext: () => void;
  refetch: () => void;
}

/**
 * 커서 페이징(`cursorId` + `size`) 목록용 무한 스크롤 훅.
 * 오프셋 페이징(알림)은 방식이 달라 별도로 다룬다.
 */
export function useCursorInfinite<T>({
  queryKey,
  fetchPage,
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
}: UseCursorInfiniteOptions<T>): UseCursorInfiniteResult<T> {
  const query = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) => fetchPage({ cursorId: pageParam, size }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursorId !== null ? lastPage.nextCursorId : undefined,
  });

  const items = query.data?.pages.flatMap((page) => page.items ?? []) ?? [];

  return {
    items,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    isEmpty: !query.isPending && !query.isError && items.length === 0,
    hasNext: query.hasNextPage,
    isFetchingNext: query.isFetchingNextPage,
    fetchNext: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
    refetch: () => void query.refetch(),
  };
}
