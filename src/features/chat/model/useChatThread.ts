'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toErrorMessage } from '@/shared/api/errors';
import type { ChatMessageResponse } from '@/shared/api/types';

import { CHAT_PAGE_SIZE, fetchOlderMessages, useLatestMessages, useSendMessage } from '../api';

/** 서버 응답을 기다리는 동안 회색으로 먼저 그려두는 메시지 */
export interface PendingMessage {
  tempId: string;
  message: string;
  createdAt: string;
  failed: boolean;
}

function sortAscending(messages: ChatMessageResponse[]): ChatMessageResponse[] {
  return [...messages].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return Number.isNaN(diff) || diff === 0 ? a.id - b.id : diff;
  });
}

function dedupe(messages: ChatMessageResponse[]): ChatMessageResponse[] {
  const byId = new Map<number, ChatMessageResponse>();
  for (const message of messages) byId.set(message.id, message);
  return sortAscending([...byId.values()]);
}

/**
 * 채팅 한 방의 메시지 상태.
 *
 * 서버는 최신순으로 페이지를 주므로 화면에 그릴 때 뒤집는다.
 * page 0은 폴링으로 계속 갱신되고, 위로 스크롤하면 page 1, 2…를 앞에 붙인다.
 */
export function useChatThread(roomId: number) {
  const latest = useLatestMessages(roomId);
  const send = useSendMessage(roomId);

  const [older, setOlder] = useState<ChatMessageResponse[]>([]);
  const [page, setPage] = useState(0);
  const [reachedStart, setReachedStart] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [pending, setPending] = useState<PendingMessage[]>([]);

  const roomRef = useRef(roomId);

  // 방을 옮기면 이전 방의 상태를 모두 버린다
  useEffect(() => {
    if (roomRef.current === roomId) return;

    roomRef.current = roomId;
    setOlder([]);
    setPage(0);
    setReachedStart(false);
    setPending([]);
  }, [roomId]);

  const messages = useMemo(
    () => dedupe([...older, ...(latest.data ?? [])]),
    [older, latest.data],
  );

  const hasOlder =
    !reachedStart && (latest.data?.length ?? 0) >= CHAT_PAGE_SIZE;

  const loadOlder = useCallback(async () => {
    if (loadingOlder || reachedStart) return;

    setLoadingOlder(true);
    try {
      const nextPage = page + 1;
      const fetched = await fetchOlderMessages(roomId, nextPage);

      setOlder((current) => dedupe([...fetched, ...current]));
      setPage(nextPage);
      if (fetched.length < CHAT_PAGE_SIZE) setReachedStart(true);
    } catch {
      // 이전 내역을 못 불러와도 현재 대화는 계속 볼 수 있어야 한다
      setReachedStart(true);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, page, reachedStart, roomId]);

  const deliver = useCallback(
    async (tempId: string, text: string) => {
      try {
        await send.mutateAsync(text);
        setPending((current) => current.filter((item) => item.tempId !== tempId));
        return true;
      } catch (error) {
        setPending((current) =>
          current.map((item) => (item.tempId === tempId ? { ...item, failed: true } : item)),
        );
        return toErrorMessage(error);
      }
    },
    [send],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed === '') return true;

      const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setPending((current) => [
        ...current,
        { tempId, message: trimmed, createdAt: new Date().toISOString(), failed: false },
      ]);

      return deliver(tempId, trimmed);
    },
    [deliver],
  );

  const retry = useCallback(
    async (tempId: string) => {
      const target = pending.find((item) => item.tempId === tempId);
      if (!target) return true;

      setPending((current) =>
        current.map((item) => (item.tempId === tempId ? { ...item, failed: false } : item)),
      );
      return deliver(tempId, target.message);
    },
    [deliver, pending],
  );

  const discard = useCallback((tempId: string) => {
    setPending((current) => current.filter((item) => item.tempId !== tempId));
  }, []);

  return {
    messages,
    pending,
    isPending: latest.isPending,
    isError: latest.isError,
    error: latest.error,
    refetch: () => void latest.refetch(),
    hasOlder,
    loadingOlder,
    loadOlder,
    sendMessage,
    sending: send.isPending,
    retry,
    discard,
  };
}
