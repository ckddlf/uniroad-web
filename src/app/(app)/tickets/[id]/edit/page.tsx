import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TicketEditView } from '@/features/ticket/ui/TicketEditView';

export const metadata: Metadata = { title: '티켓 수정' };
export const dynamic = 'force-dynamic';

export default async function TicketEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-h1 text-ink-900">티켓 수정</h1>
      <TicketEditView ticketId={ticketId} />
    </div>
  );
}
