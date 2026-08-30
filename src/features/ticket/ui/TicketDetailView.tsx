'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, ChevronLeft, MessageSquare, Siren } from 'lucide-react';

import { AuthorChip } from '@/entities/trade/AuthorChip';
import {
  isTicketExpired,
  TICKET_TYPE_EMOJI,
  TICKET_TYPE_FIELDS,
  ticketTypeLabel,
} from '@/entities/ticket/ticketType';
import { isApiError, toErrorMessage } from '@/shared/api/errors';
import type { TicketTransferResponseDto } from '@/shared/api/types';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { discountRate, formatNumber } from '@/shared/lib/format';
import { TICKET_STATUS } from '@/shared/lib/constants';
import { useAuthStore } from '@/shared/store/authStore';
import {
  Badge,
  Button,
  buttonClass,
  EmptyState,
  ErrorState,
  Modal,
  ReportModal,
  Skeleton,
  useToast,
  VerifiedGate,
} from '@/shared/ui';

import { useCreateChatRoom } from '@/features/chat/api';

import { useCompleteTicket, useDeleteTicket, useTicket, useToggleTicketScrap } from '../api';

const FIELD_LABEL: Record<string, string> = {
  useDate: '이용일',
  useTime: '이용 시간',
  placeName: '장소',
  performanceDate: '공연일',
  performanceTime: '공연 시간',
  performancePlace: '공연장',
  departureDate: '출발일',
  departureTime: '출발 시간',
  departureStation: '출발역',
  arrivalStation: '도착역',
  departureAirport: '출발 공항',
  arrivalAirport: '도착 공항',
  checkInDate: '체크인',
  checkOutDate: '체크아웃',
  accommodationName: '숙소 이름',
  customTicketType: '티켓 종류',
};

export function TicketDetailView({ ticketId }: { ticketId: number }) {
  const router = useRouter();
  const toast = useToast();
  const member = useAuthStore((state) => state.member);

  const ticket = useTicket(ticketId);
  const toggleScrap = useToggleTicketScrap(ticketId);
  const complete = useCompleteTicket(ticketId);
  const deleteTicket = useDeleteTicket();
  const createRoom = useCreateChatRoom();

  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (ticket.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (ticket.isError) {
    if (isApiError(ticket.error) && ticket.error.status === 404) {
      return (
        <EmptyState
          title="삭제됐거나 없는 티켓이에요"
          action={
            <Link href="/tickets" className={buttonClass()}>
              티켓 양도로
            </Link>
          }
        />
      );
    }
    return <ErrorState error={ticket.error} onRetry={() => void ticket.refetch()} />;
  }

  const data = ticket.data;
  const discount = discountRate(data.originalPrice, data.transferPrice);
  const completed = data.status === 'COMPLETED';
  const expired = !completed && isTicketExpired(data);

  const mine = member !== null && data.memberId === member.id;
  const fields = TICKET_TYPE_FIELDS[data.ticketType] as readonly string[];

  const startChat = async () => {
    if (data.memberId === undefined) return;

    try {
      const room = await createRoom.mutateAsync({
        referenceType: 'TICKET',
        referenceId: ticketId,
        targetMemberId: data.memberId,
      });
      router.push(`/chat/${room.roomId}`);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const finish = async () => {
    try {
      await complete.mutateAsync();
      toast.success('양도완료로 바꿨어요.');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const remove = async () => {
    try {
      await deleteTicket.mutateAsync(ticketId);
      toast.success('삭제했어요.');
      router.replace('/tickets');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <Link
        href="/tickets"
        className="inline-flex items-center gap-1 self-start text-caption text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft aria-hidden className="size-4" />
        티켓 양도
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            {TICKET_TYPE_EMOJI[data.ticketType]} {ticketTypeLabel(data)}
          </Badge>
          {data.country && <Badge tone="brand">{data.country}</Badge>}
          {completed && <Badge tone="neutral">{TICKET_STATUS.COMPLETED}</Badge>}
          {expired && <Badge tone="warning">날짜 지남</Badge>}
        </div>

        <h1 className="text-h1 text-ink-900">{data.title}</h1>
        <p className="text-caption text-ink-500">{formatDateTime(data.createdAt)} 등록</p>
      </header>

      <section className="rounded-lg border border-ink-100 bg-surface p-5">
        <h2 className="mb-3 text-h2 text-ink-900">티켓 정보</h2>

        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {fields.map((field) => {
            const value = data[field as keyof TicketTransferResponseDto];
            if (typeof value !== 'string' || value.trim() === '') return null;

            return (
              <div key={field} className="flex flex-col gap-0.5">
                <dt className="text-caption text-ink-500">{FIELD_LABEL[field] ?? field}</dt>
                <dd className="text-body text-ink-900">
                  {field.endsWith('Date') ? formatDate(value) : value}
                </dd>
              </div>
            );
          })}

          <div className="flex flex-col gap-0.5">
            <dt className="text-caption text-ink-500">수량</dt>
            <dd className="text-body text-ink-900">{data.quantity}장</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-wrap items-end gap-4 rounded-lg border border-brand-100 bg-brand-50 p-5">
        <div>
          <p className="text-caption text-ink-500">양도가</p>
          <p className="text-display text-ink-900">{formatNumber(data.transferPrice)}</p>
        </div>

        {data.originalPrice ? (
          <div>
            <p className="text-caption text-ink-500">정가</p>
            <p className="text-h2 text-ink-500 line-through">{formatNumber(data.originalPrice)}</p>
          </div>
        ) : null}

        {discount !== null && (
          <Badge tone="brand" className="mb-1">
            {discount}% 할인
          </Badge>
        )}
      </section>

      <div className="border-y border-ink-100 py-4">
        <AuthorChip author={data} withAvatar />
      </div>

      {data.content && (
        <section className="flex flex-col gap-3">
          <h2 className="text-h2 text-ink-900">설명</h2>
          <p className="text-body whitespace-pre-wrap text-ink-700">{data.content}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {/* memberId를 내려주지 않는 서버 버전에서는 채팅을 열 수 없어 버튼을 숨긴다 */}
        {!mine && !completed && data.memberId !== undefined && (
          <VerifiedGate>
            <Button
              loading={createRoom.isPending}
              onClick={() => void startChat()}
              leftIcon={<MessageSquare aria-hidden className="size-4" />}
            >
              채팅하기
            </Button>
          </VerifiedGate>
        )}

        <Button
          variant="secondary"
          loading={toggleScrap.isPending}
          onClick={() => toggleScrap.mutate()}
          leftIcon={<Bookmark aria-hidden className="size-4" />}
        >
          스크랩 {formatNumber(data.scrapCount)}
        </Button>

        {!mine && (
          <Button
            variant="ghost"
            onClick={() => setReportOpen(true)}
            leftIcon={<Siren aria-hidden className="size-4" />}
          >
            신고
          </Button>
        )}
      </div>

      {mine && (
        <div className="flex flex-col gap-2 rounded-md border border-ink-100 bg-canvas p-4">
          <p className="text-label font-medium text-ink-700">내 티켓 관리</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/tickets/${ticketId}/edit`}
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
            >
              수정
            </Link>
            {!completed && (
              <Button size="sm" variant="secondary" loading={complete.isPending} onClick={() => void finish()}>
                양도완료
              </Button>
            )}
            <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
              삭제
            </Button>
          </div>
        </div>
      )}

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="TICKET_TRANSFER"
        targetId={ticketId}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="티켓 글을 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="danger" loading={deleteTicket.isPending} onClick={() => void remove()}>
              삭제
            </Button>
          </>
        }
      />
    </article>
  );
}
