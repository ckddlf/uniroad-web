'use client';

import Link from 'next/link';

import { useAuthStore } from '@/shared/store/authStore';
import { buttonClass, EmptyState, ErrorState, Skeleton } from '@/shared/ui';

import { useTicket } from '../api';
import { TicketForm } from './TicketForm';

export function TicketEditView({ ticketId }: { ticketId: number }) {
  const ticket = useTicket(ticketId);
  const myId = useAuthStore((state) => state.member?.id);

  if (ticket.isPending) return <Skeleton className="h-96 w-full" />;
  if (ticket.isError) return <ErrorState error={ticket.error} onRetry={() => void ticket.refetch()} />;

  if (myId === undefined || ticket.data.memberId !== myId) {
    return (
      <EmptyState
        title="수정할 수 없는 글이에요"
        description="내가 올린 티켓 글만 수정할 수 있어요."
        action={
          <Link href={`/tickets/${ticketId}`} className={buttonClass()}>
            티켓 글로 돌아가기
          </Link>
        }
      />
    );
  }

  return <TicketForm ticketId={ticketId} initial={ticket.data} />;
}
