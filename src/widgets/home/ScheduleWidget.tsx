'use client';

import { CalendarDays, ListChecks } from 'lucide-react';

import { checklistProgress, parsePeriod, scheduleStateLabel } from '@/entities/schedule/period';
import { useExchangeInfo } from '@/features/schedule/api';
import { isApiError } from '@/shared/api/errors';
import { Badge, ProgressBar, Skeleton } from '@/shared/ui';

import { WidgetCard } from './WidgetCard';

/** 다음 일정 2건과 제출 서류 진행률 — 스케줄 화면과 같은 계산식을 쓴다 */
export function ScheduleWidget() {
  const info = useExchangeInfo();

  const body = () => {
    if (info.isPending) return <Skeleton className="h-24 w-full" />;

    if (info.isError) {
      if (isApiError(info.error) && info.error.status === 404) {
        return (
          <p className="text-body text-ink-500">
            학교 정보를 등록하면 국제처 일정과 제출 서류를 정리해 드려요.
          </p>
        );
      }
      return <p className="text-body text-ink-500">일정을 불러오지 못했어요.</p>;
    }

    const upcoming = info.data.schedules
      .map((schedule) => ({ schedule, period: parsePeriod(schedule.period) }))
      .filter((entry) => entry.period.state !== 'past')
      .slice(0, 2);

    const progress = checklistProgress(info.data.requiredDocuments ?? []);

    return (
      <div className="flex flex-col gap-4">
        {upcoming.length === 0 ? (
          <p className="text-body text-ink-500">남은 일정이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((entry, index) => (
              <li key={`${entry.schedule.title}-${index}`} className="flex flex-wrap items-center gap-2">
                <span className="text-body text-ink-900">{entry.schedule.title}</span>
                <span className="text-caption text-ink-500">{entry.period.label}</span>
                {entry.period.state && (
                  <Badge tone={entry.period.state === 'ongoing' ? 'brand' : 'info'}>
                    {scheduleStateLabel(entry.period.state)}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-ink-100 pt-4">
          <p className="mb-2 inline-flex items-center gap-1.5 text-label font-medium text-ink-700">
            <ListChecks aria-hidden className="size-4 text-ink-500" />
            제출 서류 {progress.done}/{progress.total}
          </p>
          <ProgressBar value={progress.percent} showValue />
        </div>
      </div>
    );
  };

  return (
    <WidgetCard
      title="준비 일정"
      icon={<CalendarDays aria-hidden className="size-5 text-ink-500" />}
      href="/schedule"
    >
      {body()}
    </WidgetCard>
  );
}
