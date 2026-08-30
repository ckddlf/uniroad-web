import Link from 'next/link';
import { Bookmark } from 'lucide-react';

import { AuthorChip } from '@/entities/trade/AuthorChip';
import {
  isTicketExpired,
  TICKET_TYPE_EMOJI,
  ticketSummaryLine,
  ticketTypeLabel,
} from '@/entities/ticket/ticketType';
import type { TicketTransferResponseDto } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { TICKET_STATUS } from '@/shared/lib/constants';
import { discountRate, formatNumber } from '@/shared/lib/format';
import { Badge } from '@/shared/ui';

export function TicketCard({ ticket }: { ticket: TicketTransferResponseDto }) {
  const summary = ticketSummaryLine(ticket);
  const discount = discountRate(ticket.originalPrice, ticket.transferPrice);
  const completed = ticket.status === 'COMPLETED';
  // 서버에 만료 필터가 없어 받아온 페이지 안에서만 지난 티켓을 흐리게 처리한다
  const expired = !completed && isTicketExpired(ticket);

  return (
    <li>
      <Link
        href={`/tickets/${ticket.id}`}
        className={cn(
          'flex h-full flex-col gap-2 rounded-lg border border-ink-100 bg-surface p-4 transition-colors hover:border-ink-300',
          (completed || expired) && 'opacity-60',
        )}
      >
        <div className="flex items-center gap-2">
          <Badge>
            {TICKET_TYPE_EMOJI[ticket.ticketType]} {ticketTypeLabel(ticket)}
          </Badge>
          {completed && <Badge tone="neutral">{TICKET_STATUS.COMPLETED}</Badge>}
          {expired && <Badge tone="warning">날짜 지남</Badge>}
          {discount !== null && <Badge tone="brand">{discount}% 할인</Badge>}
        </div>

        <h3 className="line-clamp-2-safe text-body font-medium text-ink-900">{ticket.title}</h3>

        {summary && <p className="text-caption text-ink-700">{summary}</p>}

        <div className="flex items-baseline gap-2">
          <span className="text-body font-medium text-ink-900">
            {formatNumber(ticket.transferPrice)}
          </span>
          {ticket.originalPrice ? (
            <span className="text-caption text-ink-500 line-through">
              {formatNumber(ticket.originalPrice)}
            </span>
          ) : null}
          <span className="text-caption text-ink-500">· {ticket.quantity}장</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <AuthorChip author={ticket} className="min-w-0 flex-1" />
          <span className="inline-flex shrink-0 items-center gap-1 text-caption text-ink-500">
            <Bookmark aria-hidden className="size-3.5" />
            {formatNumber(ticket.scrapCount)}
          </span>
        </div>
      </Link>
    </li>
  );
}
