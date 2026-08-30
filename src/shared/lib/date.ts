import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isValid,
  parse,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

/** 서버 전송 포맷 */
export const SERVER_DATE_FORMAT = 'yyyy-MM-dd';
export const SERVER_TIME_FORMAT = 'HH:mm';

/** 서버가 내려주는 문자열은 형태가 제각각이라 파싱 실패를 항상 허용한다 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  if (isValid(parsed)) return parsed;

  const fallback = parse(value, SERVER_DATE_FORMAT, new Date());
  return isValid(fallback) ? fallback : null;
}

export function toServerDate(date: Date): string {
  return format(date, SERVER_DATE_FORMAT);
}

/** 2026-05-08 → 2026년 5월 8일 */
export function formatDate(value: string | Date | null | undefined, pattern = 'yyyy년 M월 d일'): string {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return '-';
  return format(date, pattern, { locale: ko });
}

/** 2026-05-08T14:20 → 5월 8일 14:20 */
export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, 'M월 d일 HH:mm');
}

export function formatTime(value: string | Date | null | undefined): string {
  return formatDate(value, 'HH:mm');
}

/** 목록 카드용 상대 시간 — 7일이 넘으면 날짜로 표기 */
export function formatRelative(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return '-';

  const days = Math.abs(differenceInCalendarDays(new Date(), date));
  if (days > 7) return format(date, 'yyyy. M. d.', { locale: ko });

  return formatDistanceToNowStrict(date, { addSuffix: true, locale: ko });
}

/**
 * D-day 계산. 오늘이면 0, 미래면 양수.
 * 서버에 D-day API가 없어 회원 정보의 날짜로 클라이언트에서 계산한다.
 */
export function daysUntil(value: string | Date | null | undefined): number | null {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return null;
  return differenceInCalendarDays(date, new Date());
}

/** D-42 / D-DAY / D+3 */
export function formatDday(value: string | Date | null | undefined): string | null {
  const days = daysUntil(value);
  if (days === null) return null;
  if (days === 0) return 'D-DAY';
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}
