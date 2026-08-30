import { differenceInCalendarDays } from 'date-fns';

import type { CompanionPostResponse } from '@/shared/api/types';
import { parseDate } from '@/shared/lib/date';

/** 시작·종료일로 여행 기간(일수)을 계산한다. 파싱에 실패하면 표시를 생략한다. */
export function tripLength(startDate: string, endDate: string): number | null {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return null;

  return differenceInCalendarDays(end, start) + 1;
}

export function participantRatio(post: CompanionPostResponse): number {
  if (!post.capacity || post.capacity <= 0) return 0;
  return Math.min(100, Math.round(((post.currentParticipants ?? 0) / post.capacity) * 100));
}

export function isRecruiting(post: CompanionPostResponse): boolean {
  return post.status === 'RECRUITING';
}

/** 카카오 오픈채팅 링크만 외부 이동 버튼으로 연결한다 */
export function isKakaoOpenChatLink(link: string | null | undefined): boolean {
  return typeof link === 'string' && link.startsWith('https://open.kakao.com/');
}
