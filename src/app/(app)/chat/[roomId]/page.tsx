import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ChatRoomPanel } from '@/features/chat/ui/ChatRoomPanel';

export const metadata: Metadata = { title: '채팅' };
export const dynamic = 'force-dynamic';

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const id = Number(roomId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return <ChatRoomPanel roomId={id} />;
}
