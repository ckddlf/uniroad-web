import type { TicketTransferResponseDto, TicketType } from '@/shared/api/types';
import { TICKET_TYPE } from '@/shared/lib/constants';
import { parseDate } from '@/shared/lib/date';

export const TICKET_TYPE_EMOJI: Record<TicketType, string> = {
  TOUR: '🎫',
  CONCERT: '🎤',
  TRAIN: '🚄',
  FLIGHT: '✈️',
  ACCOMMODATION: '🏨',
  ETC: '📦',
};

/** 타입마다 입력·표시하는 필드가 완전히 다르다 */
export const TICKET_TYPE_FIELDS = {
  TOUR: ['useDate', 'useTime', 'placeName'],
  CONCERT: ['performanceDate', 'performanceTime', 'performancePlace'],
  TRAIN: ['departureDate', 'departureTime', 'departureStation', 'arrivalStation'],
  FLIGHT: ['departureDate', 'departureTime', 'departureAirport', 'arrivalAirport'],
  ACCOMMODATION: ['checkInDate', 'checkOutDate', 'accommodationName'],
  ETC: ['customTicketType'],
} as const satisfies Record<TicketType, readonly string[]>;

export function ticketTypeLabel(ticket: {
  ticketType: TicketType;
  customTicketType?: string | null;
}): string {
  if (ticket.ticketType === 'ETC' && ticket.customTicketType?.trim()) {
    return ticket.customTicketType.trim();
  }
  return TICKET_TYPE[ticket.ticketType];
}

/** 목록 카드에 쓰는 핵심 일정 한 줄 — 값이 없으면 있는 것만 이어 붙인다 */
export function ticketSummaryLine(ticket: TicketTransferResponseDto): string {
  const parts: (string | null | undefined)[] = [];

  switch (ticket.ticketType) {
    case 'TOUR':
      parts.push(shortDate(ticket.useDate), ticket.useTime, ticket.placeName);
      break;
    case 'CONCERT':
      parts.push(shortDate(ticket.performanceDate), ticket.performanceTime, ticket.performancePlace);
      break;
    case 'TRAIN':
      parts.push(
        shortDate(ticket.departureDate),
        ticket.departureTime,
        joinRoute(ticket.departureStation, ticket.arrivalStation),
      );
      break;
    case 'FLIGHT':
      parts.push(
        shortDate(ticket.departureDate),
        ticket.departureTime,
        joinRoute(ticket.departureAirport, ticket.arrivalAirport),
      );
      break;
    case 'ACCOMMODATION':
      parts.push(
        joinRoute(shortDate(ticket.checkInDate), shortDate(ticket.checkOutDate), '~'),
        ticket.accommodationName,
      );
      break;
    case 'ETC':
      parts.push(ticket.customTicketType);
      break;
  }

  return parts.filter((part): part is string => Boolean(part?.trim())).join(' ');
}

/** 지난 티켓을 흐리게 처리하기 위한 기준 날짜 */
export function ticketPrimaryDate(ticket: TicketTransferResponseDto): Date | null {
  const raw =
    ticket.ticketType === 'TOUR'
      ? ticket.useDate
      : ticket.ticketType === 'CONCERT'
        ? ticket.performanceDate
        : ticket.ticketType === 'ACCOMMODATION'
          ? ticket.checkOutDate ?? ticket.checkInDate
          : ticket.departureDate;

  return parseDate(raw ?? null);
}

export function isTicketExpired(ticket: TicketTransferResponseDto): boolean {
  const date = ticketPrimaryDate(ticket);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

/** "2026-06-01" → "6/1". 형식이 다르면 원본을 그대로 쓴다. */
function shortDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value.trim();

  return `${Number(match[2])}/${Number(match[3])}`;
}

function joinRoute(
  from: string | null | undefined,
  to: string | null | undefined,
  separator = '→',
): string | null {
  const left = from?.trim();
  const right = to?.trim();

  if (left && right) return `${left} ${separator} ${right}`;
  return left ?? right ?? null;
}
