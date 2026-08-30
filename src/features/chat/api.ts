'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  ChatMessageResponse,
  ChatMessageSendRequest,
  ChatReadResponse,
  ChatRoomRequest,
  ChatRoomResponse,
} from '@/shared/api/types';
import { useDocumentVisible } from '@/shared/hooks/useDocumentVisible';

/** 메시지 한 페이지 크기. 서버 기본값과 맞춘다. */
export const CHAT_PAGE_SIZE = 20;

const ROOM_LIST_INTERVAL = 10_000;
const MESSAGE_INTERVAL = 3_000;

/**
 * 거래글·티켓 상세에서 채팅을 시작할 때 쓴다.
 * 이미 방이 있으면 서버가 기존 방을 돌려준다.
 * ※ Chat 계열 응답에는 ApiResponse 래퍼가 없다 (client의 unwrap이 알아서 판별한다).
 */
export function useCreateChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChatRoomRequest) => post<ChatRoomResponse>(endpoints.chat.rooms, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() });
    },
  });
}

/**
 * 방 목록. WebSocket 대신 폴링으로 새 메시지를 감지한다.
 * 화면이 보이지 않는 동안에는 멈추고, 돌아오면 TanStack Query가 즉시 다시 받아온다.
 */
export function useChatRooms() {
  const visible = useDocumentVisible();

  return useQuery({
    queryKey: queryKeys.chat.rooms(),
    queryFn: () => get<ChatRoomResponse[]>(endpoints.chat.rooms),
    refetchInterval: visible ? ROOM_LIST_INTERVAL : false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

/** 열린 방의 최신 페이지(page 0). 3초마다 갱신한다. */
export function useLatestMessages(roomId: number, enabled = true) {
  const visible = useDocumentVisible();

  return useQuery({
    queryKey: queryKeys.chat.messages(roomId),
    queryFn: () =>
      get<ChatMessageResponse[]>(endpoints.chat.messages(roomId), {
        page: 0,
        size: CHAT_PAGE_SIZE,
      }),
    enabled: enabled && Number.isInteger(roomId) && roomId > 0,
    refetchInterval: visible ? MESSAGE_INTERVAL : false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

/** 위로 스크롤할 때 불러오는 이전 페이지 */
export function fetchOlderMessages(roomId: number, page: number): Promise<ChatMessageResponse[]> {
  return get<ChatMessageResponse[]>(endpoints.chat.messages(roomId), {
    page,
    size: CHAT_PAGE_SIZE,
  });
}

export function useSendMessage(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => {
      const body: ChatMessageSendRequest = { message, type: 'TALK' };
      return post<ChatMessageResponse>(endpoints.chat.messages(roomId), body);
    },
    onSuccess: (sent) => {
      // 폴링을 기다리지 않고 방금 보낸 메시지를 최신 페이지에 바로 얹는다
      queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.chat.messages(roomId), (current) =>
        current?.some((message) => message.id === sent.id) ? current : [sent, ...(current ?? [])],
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() });
    },
  });
}

export function useReadChatRoom(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => post<ChatReadResponse>(endpoints.chat.read(roomId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() });
    },
  });
}

export function useLeaveChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => del<void>(endpoints.chat.leave(roomId)),
    onSuccess: (_data, roomId) => {
      queryClient.removeQueries({ queryKey: queryKeys.chat.messages(roomId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.rooms() });
    },
  });
}
