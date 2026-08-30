import type { Metadata } from 'next';

import { TicketForm } from '@/features/ticket/ui/TicketForm';

export const metadata: Metadata = { title: '티켓 등록' };
export const dynamic = 'force-dynamic';

export default function TicketWritePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-h1 text-ink-900">티켓 등록</h1>
      <TicketForm />
    </div>
  );
}
