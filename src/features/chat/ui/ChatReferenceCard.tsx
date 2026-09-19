'use client';

import Link from 'next/link';
import { Ticket as TicketIcon, ShoppingBag, Users } from 'lucide-react';

import { useCompanion } from '@/features/companion/api';
import { useTicket } from '@/features/ticket/api';
import { useUsedItem } from '@/features/market/api';
import type { ChatRefType } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';

export interface ChatReferenceCardProps {
  referenceType: ChatRefType;
  referenceId: number;
}

/** 어떤 글에서 시작된 대화인지 상단에 붙여준다 */
export function ChatReferenceCard({ referenceType, referenceId }: ChatReferenceCardProps) {
  const usedItem = useUsedItem(referenceType === 'TRADE' ? referenceId : 0);
  const ticket = useTicket(referenceType === 'TICKET' ? referenceId : 0);
  const companion = useCompanion(referenceType === 'COMPANION' ? referenceId : 0);

  if (referenceType === 'TRADE') {
    return (
      <ReferenceRow
        icon={<ShoppingBag aria-hidden className="size-4 text-ink-500" />}
        title={usedItem.data?.title ?? '중고거래 글'}
        subtitle={usedItem.data ? formatNumber(usedItem.data.price) : undefined}
        href={`/market/${referenceId}`}
      />
    );
  }

  if (referenceType === 'TICKET') {
    return (
      <ReferenceRow
        icon={<TicketIcon aria-hidden className="size-4 text-ink-500" />}
        title={ticket.data?.title ?? '티켓 양도 글'}
        subtitle={ticket.data ? formatNumber(ticket.data.transferPrice) : undefined}
        href={`/tickets/${referenceId}`}
      />
    );
  }

  if (referenceType === 'COMPANION') {
    return (
      <ReferenceRow
        icon={<Users aria-hidden className="size-4 text-ink-500" />}
        title={companion.data?.title ?? '동행 구하기 글'}
        subtitle={
          companion.data
            ? [companion.data.country, companion.data.region].filter(Boolean).join(' ')
            : undefined
        }
        href={`/companions/${referenceId}`}
      />
    );
  }

  // MENTOR는 대응하는 화면이 없어 링크 없이 문구만 보여준다
  return (
    <div className="border-b border-ink-100 px-4 py-2.5 text-caption text-ink-500">
      멘토링 관련 대화입니다.
    </div>
  );
}

function ReferenceRow({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-2.5">
      {icon}
      <span className="min-w-0 flex-1 truncate text-caption text-ink-700">
        {title}
        {subtitle && <span className="ml-2 text-ink-500">{subtitle}</span>}
      </span>
      <Link href={href} className="shrink-0 text-caption font-medium text-brand-600 hover:underline">
        보기
      </Link>
    </div>
  );
}
