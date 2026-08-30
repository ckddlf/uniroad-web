import { formatDate, parseDate } from '@/shared/lib/date';

export type ScheduleState = 'past' | 'ongoing' | 'upcoming';

export interface ParsedPeriod {
  start: Date | null;
  end: Date | null;
  /** 파싱에 실패하면 null — 이때는 상태 뱃지를 생략한다 */
  state: ScheduleState | null;
  label: string;
}

const STATE_LABEL: Record<ScheduleState, string> = {
  past: '지남',
  ongoing: '진행 중',
  upcoming: '예정',
};

export function scheduleStateLabel(state: ScheduleState): string {
  return STATE_LABEL[state];
}

/**
 * 서버는 "2026-03-16 ~ 2026-03-30" 또는 단일 날짜 문자열로 내려준다.
 * 형식이 달라질 수 있으므로 파싱에 실패하면 원문을 그대로 보여주고 상태는 표시하지 않는다.
 */
export function parsePeriod(period: string | null | undefined): ParsedPeriod {
  const raw = period?.trim() ?? '';
  if (raw === '') return { start: null, end: null, state: null, label: '' };

  const [startText, endText] = raw.split('~').map((part) => part.trim());
  const start = parseDate(startText);
  const end = endText ? parseDate(endText) : null;

  if (!start && !end) return { start: null, end: null, state: null, label: raw };

  const label = end
    ? `${formatDate(start, 'M월 d일')} ~ ${formatDate(end, 'M월 d일')}`
    : formatDate(start ?? end, 'M월 d일');

  return { start, end, state: resolveState(start, end), label };
}

function resolveState(start: Date | null, end: Date | null): ScheduleState | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const from = start ?? end;
  const to = end ?? start;
  if (!from || !to) return null;

  if (to.getTime() < today.getTime()) return 'past';
  if (from.getTime() > today.getTime()) return 'upcoming';
  return 'ongoing';
}

/** 체크리스트 진행률 — 홈 위젯과 스케줄 화면이 같은 계산을 쓴다 */
export function checklistProgress(documents: { checkedByMe: boolean }[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = documents.length;
  const done = documents.filter((document) => document.checkedByMe).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { done, total, percent };
}
