'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  CursorPage,
  UsedItemRequestDto,
  UsedItemResponseDto,
  UsedItemStatus,
  UsedItemSummaryResponseDto,
} from '@/shared/api/types';
import { useCursorInfinite } from '@/shared/hooks/useCursorInfinite';

export interface MarketFilters {
  title?: string;
  content?: string;
  country?: string;
  region?: string;
  status?: UsedItemStatus;
}

function hasFilter(filters: MarketFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined && value !== '');
}

export function useMarketList(filters: MarketFilters) {
  const searching = hasFilter(filters);

  return useCursorInfinite<UsedItemSummaryResponseDto>({
    queryKey: queryKeys.usedItem.list(filters),
    fetchPage: ({ cursorId, size }) =>
      get<CursorPage<UsedItemSummaryResponseDto>>(
        searching ? endpoints.usedItem.search : endpoints.usedItem.list,
        { cursorId, size, ...(searching ? filters : {}) },
      ),
  });
}

export function useMyMarketList(scope: 'my' | 'scraps', enabled = true) {
  const path = scope === 'my' ? endpoints.usedItem.my : endpoints.usedItem.scraps;
  const key = scope === 'my' ? queryKeys.usedItem.my() : queryKeys.usedItem.scraps();

  return useCursorInfinite<UsedItemSummaryResponseDto>({
    queryKey: key,
    enabled,
    fetchPage: ({ cursorId, size }) =>
      get<CursorPage<UsedItemSummaryResponseDto>>(path, { cursorId, size }),
  });
}

export function useUsedItem(id: number) {
  return useQuery({
    queryKey: queryKeys.usedItem.detail(id),
    queryFn: () => get<UsedItemResponseDto>(endpoints.usedItem.detail(id)),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateUsedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UsedItemRequestDto) => post<number>(endpoints.usedItem.create, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.usedItem.all() });
    },
  });
}

export function useUpdateUsedItem(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UsedItemRequestDto) => patch<void>(endpoints.usedItem.detail(id), body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.usedItem.all() });
    },
  });
}

export function useDeleteUsedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => del<void>(endpoints.usedItem.detail(id)),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.usedItem.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.usedItem.all() });
    },
  });
}

/** 판매완료 ↔ 판매중 전환. 응답 본문이 없어 호출부가 결과 상태를 기억한다. */
export function useUsedItemStatusChange(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (next: 'complete' | 'reopen') =>
      patch<void>(
        next === 'complete' ? endpoints.usedItem.complete(id) : endpoints.usedItem.reopen(id),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.usedItem.all() });
    },
  });
}

export function useToggleUsedItemScrap(id: number) {
  const queryClient = useQueryClient();
  const key = queryKeys.usedItem.detail(id);

  return useMutation({
    mutationFn: () => post<boolean>(endpoints.usedItem.scrap(id)),
    onSuccess: (scrapped) => {
      const current = queryClient.getQueryData<UsedItemResponseDto>(key);
      if (current) {
        queryClient.setQueryData<UsedItemResponseDto>(key, {
          ...current,
          scrapCount: Math.max(0, current.scrapCount + (scrapped ? 1 : -1)),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.usedItem.scraps() });
    },
  });
}
