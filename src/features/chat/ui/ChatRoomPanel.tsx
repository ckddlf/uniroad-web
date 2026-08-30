'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, LogOut, RotateCw, Send, X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { formatDate, formatTime } from '@/shared/lib/date';
import { displayName } from '@/shared/lib/format';
import { useDocumentVisible } from '@/shared/hooks/useDocumentVisible';
import { useAuthStore } from '@/shared/store/authStore';
import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  Modal,
  Skeleton,
  useToast,
} from '@/shared/ui';

import { useChatRooms, useLeaveChatRoom, useReadChatRoom } from '../api';
import { useChatThread } from '../model/useChatThread';
import { ChatReferenceCard } from './ChatReferenceCard';

export function ChatRoomPanel({ roomId }: { roomId: number }) {
  const router = useRouter();
  const toast = useToast();
  const myId = useAuthStore((state) => state.member?.id);
  const visible = useDocumentVisible();

  const rooms = useChatRooms();
  const thread = useChatThread(roomId);
  const readRoom = useReadChatRoom(roomId);
  const leaveRoom = useLeaveChatRoom();

  const [draft, setDraft] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const previousHeightRef = useRef(0);
  const lastCountRef = useRef(0);

  const room = rooms.data?.find((item) => item.roomId === roomId);
  const opponent = room ? displayName(room.opponentNickname, room.opponentName) : '상대방';

  // 방에 들어올 때와 창으로 돌아올 때 읽음 처리
  useEffect(() => {
    if (!visible) return;
    readRoom.mutate();
    // readRoom은 매 렌더마다 새 객체라 의존성에서 제외한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, visible]);

  // 새 메시지가 오면 아래로 붙이고, 이전 내역을 불러오면 보던 위치를 유지한다
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const total = thread.messages.length + thread.pending.length;

    if (thread.loadingOlder) {
      previousHeightRef.current = container.scrollHeight;
      return;
    }

    if (previousHeightRef.current > 0) {
      container.scrollTop = container.scrollHeight - previousHeightRef.current;
      previousHeightRef.current = 0;
      lastCountRef.current = total;
      return;
    }

    if (total !== lastCountRef.current) {
      container.scrollTop = container.scrollHeight;
      lastCountRef.current = total;
    }
  }, [thread.messages, thread.pending, thread.loadingOlder]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !thread.hasOlder || thread.loadingOlder) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void thread.loadOlder();
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [thread]);

  const submit = async () => {
    const text = draft;
    setDraft('');

    const result = await thread.sendMessage(text);
    if (typeof result === 'string') toast.error(result);
  };

  const leave = async () => {
    try {
      await leaveRoom.mutateAsync(roomId);
      toast.success('채팅방을 나갔어요.');
      router.replace('/chat');
    } catch {
      toast.error('나가기에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
        <Link
          href="/chat"
          aria-label="채팅 목록으로"
          className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-ink-100 md:hidden"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </Link>

        <Avatar name={opponent} size="sm" />
        <span className="min-w-0 flex-1 truncate text-body font-medium text-ink-900">{opponent}</span>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLeaveOpen(true)}
          leftIcon={<LogOut aria-hidden className="size-4" />}
        >
          나가기
        </Button>
      </header>

      {room && (
        <ChatReferenceCard referenceType={room.referenceType} referenceId={room.referenceId} />
      )}

      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        {thread.isPending && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-12 w-2/3" />
            ))}
          </div>
        )}

        {thread.isError && <ErrorState error={thread.error} onRetry={thread.refetch} />}

        {!thread.isPending && !thread.isError && thread.messages.length === 0 && thread.pending.length === 0 && (
          <EmptyState
            className="border-0"
            title="첫 메시지를 보내보세요"
            description="거래 조건이나 만날 장소를 편하게 물어보세요."
          />
        )}

        <div ref={topSentinelRef} />
        {thread.loadingOlder && (
          <p className="flex justify-center py-2 text-caption text-ink-500">
            <Loader2 aria-hidden className="mr-1 size-4 animate-spin" />
            이전 대화 불러오는 중
          </p>
        )}

        <ol className="flex flex-col gap-2">
          {thread.messages.map((message, index) => {
            const previous = thread.messages[index - 1];
            const showDate =
              !previous || formatDate(previous.createdAt) !== formatDate(message.createdAt);
            const mine = myId !== undefined && message.senderId === myId;

            if (message.type !== 'TALK') {
              return (
                <li key={message.id} className="my-2 text-center text-caption text-ink-500">
                  {message.message}
                </li>
              );
            }

            return (
              <li key={message.id} className="flex flex-col">
                {showDate && (
                  <p className="my-3 text-center text-caption text-ink-500">
                    {formatDate(message.createdAt)}
                  </p>
                )}

                <div className={cn('flex items-end gap-1.5', mine && 'flex-row-reverse')}>
                  <p
                    className={cn(
                      'max-w-[75%] rounded-lg px-3 py-2 text-body whitespace-pre-wrap',
                      mine ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-900',
                    )}
                  >
                    {message.message}
                  </p>

                  <span className="flex shrink-0 flex-col items-end text-caption text-ink-500">
                    {mine && message.read && <span>읽음</span>}
                    <span>{formatTime(message.createdAt)}</span>
                  </span>
                </div>
              </li>
            );
          })}

          {thread.pending.map((item) => (
            <li key={item.tempId} className="flex flex-col">
              <div className="flex flex-row-reverse items-end gap-1.5">
                <p
                  className={cn(
                    'max-w-[75%] rounded-lg px-3 py-2 text-body whitespace-pre-wrap',
                    item.failed ? 'bg-danger-bg text-danger' : 'bg-brand-500/60 text-white',
                  )}
                >
                  {item.message}
                </p>

                {item.failed ? (
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="다시 보내기"
                      onClick={() => void thread.retry(item.tempId)}
                      className="rounded p-1 text-ink-500 hover:bg-ink-100"
                    >
                      <RotateCw aria-hidden className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="보내지 않기"
                      onClick={() => thread.discard(item.tempId)}
                      className="rounded p-1 text-ink-500 hover:bg-ink-100"
                    >
                      <X aria-hidden className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  <span className="shrink-0 text-caption text-ink-500">보내는 중</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="flex items-end gap-2 border-t border-ink-100 p-3"
      >
        <textarea
          aria-label="메시지 입력"
          rows={1}
          value={draft}
          placeholder="메시지를 입력하세요"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // 줄바꿈은 Shift+Enter로 남겨두고 Enter는 전송에 쓴다
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-md border border-ink-300 bg-surface px-3 py-2 text-body placeholder:text-ink-300 focus:border-brand-500"
        />

        <Button type="submit" disabled={draft.trim() === ''} leftIcon={<Send aria-hidden className="size-4" />}>
          전송
        </Button>
      </form>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="채팅방을 나갈까요?"
        description="나가면 대화 내용을 다시 볼 수 없습니다."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
              취소
            </Button>
            <Button variant="danger" loading={leaveRoom.isPending} onClick={() => void leave()}>
              나가기
            </Button>
          </>
        }
      />
    </section>
  );
}
