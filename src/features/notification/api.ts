'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { NotificationResponse, Page, UnreadCountResponse } from '@/shared/api/types';
import { useDocumentVisible } from '@/shared/hooks/useDocumentVisible';

export type NotificationScope = 'all' | 'unread';

const UNREAD_COUNT_INTERVAL = 60_000;

/** 헤더 벨 뱃지용. 화면이 보이지 않는 동안에는 폴링을 멈춘다. */
export function useUnreadCount() {
  const visible = useDocumentVisible();

  return useQuery({
    queryKey: queryKeys.notification.unreadCount(),
    queryFn: () => get<UnreadCountResponse>(endpoints.notification.unreadCount),
    refetchInterval: visible ? UNREAD_COUNT_INTERVAL : false,
    staleTime: 30_000,
  });
}

/** ※ Notification 계열은 ApiResponse 래핑 없이 Spring Page가 그대로 온다 */
export function useNotifications(scope: NotificationScope, page: number, size = 20) {
  return useQuery({
    queryKey: [...queryKeys.notification.list(scope), page, size],
    queryFn: () =>
      get<Page<NotificationResponse>>(
        scope === 'all' ? endpoints.notification.all : endpoints.notification.unread,
        { page, size },
      ),
  });
}

function useNotificationMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.all() });
    },
  });
}

export function useReadNotification() {
  return useNotificationMutation<number>((id) => patch<void>(endpoints.notification.read(id)));
}

export function useReadAllNotifications() {
  return useNotificationMutation<void>(() => patch<void>(endpoints.notification.readAll));
}

export function useDeleteNotification() {
  return useNotificationMutation<number>((id) => del<void>(endpoints.notification.remove(id)));
}

export function useDeleteAllNotifications() {
  return useNotificationMutation<void>(() => del<void>(endpoints.notification.removeAll));
}
