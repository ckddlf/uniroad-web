'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/cn';

import { ChatRoomList } from './ChatRoomList';

/**
 * 데스크톱은 좌측 방 목록 + 우측 대화의 2단 구성.
 * 768px 미만에서는 한 번에 하나만 보여주고 목록 ↔ 대화를 전환한다.
 */
export function ChatShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const roomOpen = /^\/chat\/\d+/.test(pathname);

  return (
    <div className="grid h-[calc(100dvh-13rem)] min-h-96 overflow-hidden rounded-lg border border-ink-100 bg-surface md:h-[calc(100dvh-9rem)] md:grid-cols-[20rem_1fr]">
      <aside
        aria-label="채팅 목록"
        className={cn(
          'scrollbar-thin min-h-0 overflow-y-auto border-ink-100 md:block md:border-r',
          roomOpen && 'hidden',
        )}
      >
        <h1 className="border-b border-ink-100 px-4 py-3 text-h2 text-ink-900">채팅</h1>
        <ChatRoomList />
      </aside>

      <div className={cn('min-h-0', !roomOpen && 'hidden md:block')}>{children}</div>
    </div>
  );
}
