import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = { title: '채팅' };
export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <div className="hidden h-full flex-col items-center justify-center gap-2 text-center md:flex">
      <MessageSquare aria-hidden className="size-8 text-ink-300" />
      <p className="text-body text-ink-500">왼쪽에서 대화를 선택해주세요.</p>
    </div>
  );
}
