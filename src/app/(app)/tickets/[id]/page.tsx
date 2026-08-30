import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TicketDetailView } from '@/features/ticket/ui/TicketDetailView';

export const metadata: Metadata = { title: '티켓 양도' };
export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) notFound();

  return <TicketDetailView ticketId={ticketId} />;
}
