import type { ReactNode } from 'react';

import { ChatShell } from '@/features/chat/ui/ChatShell';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <ChatShell>{children}</ChatShell>;
}
