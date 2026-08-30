'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch, post, put } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  CompanionPostRequest,
  CompanionPostResponse,
  CompanionStatus,
  CursorPage,
} from '@/shared/api/types';
import { useCursorInfinite } from '@/shared/hooks/useCursorInfinite';

export interface CompanionFilters {
  status?: CompanionStatus;
  country?: string;
  region?: string;
  /** yyyy-MM-dd */
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

function hasFilter(filters: CompanionFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined && value !== '');
}

export function useCompanionList(filters: CompanionFilters, enabled = true) {
  const searching = hasFilter(filters);

  return useCursorInfinite<CompanionPostResponse>({
    queryKey: queryKeys.companion.list(filters),
    enabled,
    fetchPage: ({ cursorId, size }) =>
      get<CursorPage<CompanionPostResponse>>(
        searching ? endpoints.companion.search : endpoints.companion.list,
        { cursorId, size, ...(searching ? filters : {}) },
      ),
  });
}

export function useMyCompanionList(scope: 'my' | 'scraps', enabled = true) {
  const path = scope === 'my' ? endpoints.companion.my : endpoints.companion.scraps;
  const key = scope === 'my' ? queryKeys.companion.my() : queryKeys.companion.scraps();

  return useCursorInfinite<CompanionPostResponse>({
    queryKey: key,
    enabled,
    fetchPage: ({ cursorId, size }) =>
      get<CursorPage<CompanionPostResponse>>(path, { cursorId, size }),
  });
}

export function useCompanion(postId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.companion.detail(postId),
    queryFn: () => get<CompanionPostResponse>(endpoints.companion.detail(postId)),
    enabled: enabled && Number.isInteger(postId) && postId > 0,
  });
}

export function useCreateCompanion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CompanionPostRequest) => post<number>(endpoints.companion.create, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.companion.all() });
    },
  });
}

export function useUpdateCompanion(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CompanionPostRequest) => put<void>(endpoints.companion.detail(postId), body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.companion.all() });
    },
  });
}

export function useDeleteCompanion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => del<void>(endpoints.companion.detail(postId)),
    onSuccess: (_data, postId) => {
      queryClient.removeQueries({ queryKey: queryKeys.companion.detail(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.companion.all() });
    },
  });
}

export function useCompleteCompanion(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => patch<void>(endpoints.companion.complete(postId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.companion.all() });
    },
  });
}

export function useToggleCompanionScrap(postId: number) {
  const queryClient = useQueryClient();
  const key = queryKeys.companion.detail(postId);

  return useMutation({
    mutationFn: () => post<boolean>(endpoints.companion.scrap(postId)),
    onSuccess: (scrapped) => {
      const current = queryClient.getQueryData<CompanionPostResponse>(key);
      if (current) {
        queryClient.setQueryData<CompanionPostResponse>(key, {
          ...current,
          scrapCount: Math.max(0, current.scrapCount + (scrapped ? 1 : -1)),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.companion.scraps() });
    },
  });
}
