'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch, post, put } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  CursorPage,
  TicketStatus,
  TicketTransferRequestDto,
  TicketTransferResponseDto,
} from '@/shared/api/types';
import { useCursorInfinite } from '@/shared/hooks/useCursorInfinite';

export interface TicketFilters {
  title?: string;
  content?: string;
  country?: string;
  /** 장소·역·공항·숙소 이름을 함께 검색한다 */
  location?: string;
  status?: TicketStatus;
}

function hasFilter(filters: TicketFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined && value !== '');
}

export function useTicketList(filters: TicketFilters) {
  const searching = hasFilter(filters);

  return useCursorInfinite<TicketTransferResponseDto>({
    queryKey: queryKeys.ticket.list(filters),
    fetchPage: ({ cursorId, size }) =>
      get<CursorPage<TicketTransferResponseDto>>(
        searching ? endpoints.ticket.search : endpoints.ticket.list,
        { cursorId, size, ...(searching ? filters : {}) },
      ),
  });
}

export function useMyTicketList(scope: 'my' | 'scraps', enabled = true) {
  const path = scope === 'my' ? endpoints.ticket.my : endpoints.ticket.scraps;
  const key = scope === 'my' ? queryKeys.ticket.my() : queryKeys.ticket.scraps();

  return useCursorInfinite<TicketTransferResponseDto>({
    queryKey: key,
    enabled,
    fetchPage: ({ cursorId, size }) =>
      get<CursorPage<TicketTransferResponseDto>>(path, { cursorId, size }),
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: queryKeys.ticket.detail(id),
    queryFn: () => get<TicketTransferResponseDto>(endpoints.ticket.detail(id)),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TicketTransferRequestDto) => post<number>(endpoints.ticket.create, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ticket.all() });
    },
  });
}

export function useUpdateTicket(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TicketTransferRequestDto) => put<void>(endpoints.ticket.detail(id), body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ticket.all() });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => del<void>(endpoints.ticket.detail(id)),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.ticket.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ticket.all() });
    },
  });
}

export function useCompleteTicket(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => patch<void>(endpoints.ticket.complete(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ticket.all() });
    },
  });
}

export function useToggleTicketScrap(id: number) {
  const queryClient = useQueryClient();
  const key = queryKeys.ticket.detail(id);

  return useMutation({
    mutationFn: () => post<boolean>(endpoints.ticket.scrap(id)),
    onSuccess: (scrapped) => {
      const current = queryClient.getQueryData<TicketTransferResponseDto>(key);
      if (current) {
        queryClient.setQueryData<TicketTransferResponseDto>(key, {
          ...current,
          scrapCount: Math.max(0, current.scrapCount + (scrapped ? 1 : -1)),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.ticket.scraps() });
    },
  });
}
