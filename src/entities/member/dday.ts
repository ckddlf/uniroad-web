import type { MemberResponseDto } from '@/shared/api/types';
import { formatDday } from '@/shared/lib/date';

export interface DdayTarget {
  /** yyyy-MM-dd */
  date: string;
  /** "출국까지" 처럼 앞에 붙는 문구 */
  label: string;
  /** D-42 / D-DAY / D+3 */
  text: string;
}

/**
 * D-day 계산용 날짜는 현재 상황에 따라 다르다. 서버에 D-day API가 없어 클라이언트에서 고른다.
 * 파견 중이면 귀국일을, 그 밖에는 각 단계의 마감일을 본다.
 */
export function selectDdayTarget(member: MemberResponseDto | null): DdayTarget | null {
  if (!member) return null;

  const candidates: { date: string | null; label: string }[] =
    member.currentSituation === 'DISPATCHED'
      ? [
          { date: member.returnDate, label: '귀국까지' },
          { date: member.dispatchStartDate, label: '파견 시작까지' },
        ]
      : member.currentSituation === 'PREPARING_DEPARTURE'
        ? [{ date: member.departureDate, label: '출국까지' }]
        : [{ date: member.applicationDeadline, label: '지원 마감까지' }];

  for (const candidate of candidates) {
    const text = formatDday(candidate.date);
    if (candidate.date && text) return { date: candidate.date, label: candidate.label, text };
  }

  return null;
}

/** "한국대학교 → 소르본 대학교 · 프랑스 파리 · 25년 2학기" */
export function formatDispatchSummary(member: MemberResponseDto | null): string | null {
  if (!member) return null;

  const schools = [member.domesticUniversity, member.dispatchedUniversity].filter(Boolean);
  const place = [member.dispatchedCountry, member.dispatchedRegion].filter(Boolean).join(' ');
  const term =
    member.dispatchYear && member.dispatchSemester
      ? `${String(member.dispatchYear).slice(2)}년 ${member.dispatchSemester}`
      : null;

  const parts = [schools.join(' → ') || null, place || null, term].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}
