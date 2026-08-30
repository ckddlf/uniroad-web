'use client';

import { formatDispatchSummary, selectDdayTarget } from '@/entities/member/dday';
import { CURRENT_SITUATION, ROLE } from '@/shared/lib/constants';
import { formatDate } from '@/shared/lib/date';
import { displayName } from '@/shared/lib/format';
import { useAuthStore } from '@/shared/store/authStore';
import { Badge, Skeleton } from '@/shared/ui';

/**
 * 홈 상단 인사 영역.
 * 준비 일정·인기글·거래·가계부 위젯은 STEP 10에서, 인증 유도 배너는 STEP 3에서 셸에 붙는다.
 */
export function HomeGreeting() {
  const member = useAuthStore((state) => state.member);

  if (!member) {
    return <Skeleton className="h-28 w-full" />;
  }

  const dday = selectDdayTarget(member);
  const summary = formatDispatchSummary(member);

  return (
    <section className="rounded-lg border border-ink-100 bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-ink-900">
            👋 {displayName(member.nickname, member.name)}님
            {dday && (
              <span className="ml-2 text-brand-600">
                {dday.label} {dday.text}
              </span>
            )}
          </h1>

          {summary ? (
            <p className="text-body text-ink-500">{summary}</p>
          ) : (
            <p className="text-body text-ink-500">파견 정보를 입력하면 D-day를 보여드릴게요.</p>
          )}

          {dday && <p className="text-caption text-ink-500">{formatDate(dday.date)} 예정</p>}
        </div>

        <div className="flex items-center gap-2">
          {member.currentSituation && (
            <Badge tone="neutral">{CURRENT_SITUATION[member.currentSituation]}</Badge>
          )}
          <Badge tone={member.role === 'USER' ? 'neutral' : 'brand'}>
            {member.role === 'USER' ? '인증 전' : ROLE[member.role]}
          </Badge>
        </div>
      </div>
    </section>
  );
}
