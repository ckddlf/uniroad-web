'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import { formatRelative } from '@/shared/lib/date';
import { displayName } from '@/shared/lib/format';
import { Avatar, EmptyState, ErrorState, Skeleton } from '@/shared/ui';

import { useChatRooms } from '../api';

export function ChatRoomList() {
  const rooms = useChatRooms();
  const params = useParams<{ roomId?: string }>();
  const activeRoomId = Number(params?.roomId);

  if (rooms.isPending) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (rooms.isError) {
    return <ErrorState className="m-3" error={rooms.error} onRetry={() => void rooms.refetch()} />;
  }

  if (rooms.data.length === 0) {
    return (
      <EmptyState
        className="m-3 border-0"
        title="아직 대화가 없어요"
        description="중고거래·티켓 글에서 채팅을 걸면 여기에 쌓여요."
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {rooms.data.map((room) => {
        const name = displayName(room.opponentNickname, room.opponentName);
        const active = room.roomId === activeRoomId;

        return (
          <li key={room.roomId}>
            <Link
              href={`/chat/${room.roomId}`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 border-b border-ink-100 px-4 py-3.5 transition-colors',
                active ? 'bg-brand-50' : 'hover:bg-ink-100/60',
              )}
            >
              <Avatar name={name} />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-body font-medium text-ink-900">{name}</span>
                  <span className="shrink-0 text-caption text-ink-500">
                    {room.lastMessageCreatedAt ? formatRelative(room.lastMessageCreatedAt) : ''}
                  </span>
                </div>

                <p className="truncate text-caption text-ink-500">
                  {room.lastMessage ?? '대화를 시작해보세요.'}
                </p>
              </div>

              {room.unreadCount > 0 && (
                <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 py-0.5 text-caption font-medium text-white">
                  {room.unreadCount > 99 ? '99+' : room.unreadCount}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
