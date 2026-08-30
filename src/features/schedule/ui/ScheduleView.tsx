'use client';

import Link from 'next/link';
import { CalendarDays, Mail, Phone } from 'lucide-react';

import { formatDispatchSummary, selectDdayTarget } from '@/entities/member/dday';
import { checklistProgress, parsePeriod, scheduleStateLabel } from '@/entities/schedule/period';
import { isApiError, toErrorMessage } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/date';
import { useAuthStore } from '@/shared/store/authStore';
import {
  Badge,
  buttonClass,
  Checkbox,
  EmptyState,
  ErrorState,
  ProgressBar,
  Skeleton,
  useToast,
} from '@/shared/ui';

import { useExchangeInfo, useToggleDocumentCheck } from '../api';

export function ScheduleView() {
  const toast = useToast();
  const member = useAuthStore((state) => state.member);
  const info = useExchangeInfo();
  const toggleDocument = useToggleDocumentCheck();

  const dday = selectDdayTarget(member);
  const summary = formatDispatchSummary(member);

  if (info.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (info.isError) {
    // 학교가 없거나 아직 자료가 등록되지 않은 경우는 오류가 아니라 빈 상태로 다룬다
    if (isApiError(info.error) && info.error.status === 404) {
      const noUniversity = info.error.code === 'UNIVERSITY_NOT_FOUND';

      return (
        <EmptyState
          title={noUniversity ? '재학 중인 학교를 먼저 알려주세요' : '아직 준비되지 않은 학교예요'}
          description={
            noUniversity
              ? '마이페이지에서 학교를 입력하면 국제처 일정과 제출 서류를 정리해 드려요.'
              : '제보해주시면 추가할게요. 그동안은 가계부와 커뮤니티를 먼저 둘러보세요.'
          }
          action={
            <Link href={noUniversity ? '/my/profile' : '/community'} className={buttonClass()}>
              {noUniversity ? '학교 입력하러 가기' : '커뮤니티 둘러보기'}
            </Link>
          }
        />
      );
    }

    return <ErrorState error={info.error} onRetry={() => void info.refetch()} />;
  }

  const data = info.data;
  const progress = checklistProgress(data.requiredDocuments ?? []);

  const onToggle = (documentId: number, checked: boolean) => {
    toggleDocument.mutate(
      { documentId, checked },
      { onError: (error) => toast.error(toErrorMessage(error)) },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-ink-100 bg-surface p-6 shadow-card">
        {dday ? (
          <>
            <p className="text-h1 text-ink-900">
              {dday.label} <span className="text-brand-600">{dday.text}</span>
            </p>
            <p className="mt-1 text-body text-ink-500">{formatDate(dday.date)} 예정</p>
          </>
        ) : (
          <p className="text-body text-ink-500">
            파견 일정을 입력하면 D-day를 보여드릴게요.
          </p>
        )}
        {summary && <p className="mt-2 text-caption text-ink-500">{summary}</p>}
      </section>

      <section className="rounded-lg border border-ink-100 bg-surface p-6">
        <h2 className="text-h2 text-ink-900">{data.universityName}</h2>
        {data.officeName && <p className="mt-1 text-body text-ink-700">{data.officeName}</p>}

        <div className="mt-3 flex flex-wrap gap-4 text-body text-ink-700">
          {data.phone && (
            <a href={`tel:${data.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
              <Phone aria-hidden className="size-4 text-ink-500" />
              {data.phone}
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 hover:underline">
              <Mail aria-hidden className="size-4 text-ink-500" />
              {data.email}
            </a>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-ink-100 bg-surface p-6">
        <h2 className="inline-flex items-center gap-2 text-h2 text-ink-900">
          <CalendarDays aria-hidden className="size-5 text-ink-500" />
          준비 일정
        </h2>

        {data.schedules.length === 0 ? (
          <p className="mt-4 text-body text-ink-500">등록된 일정이 없어요.</p>
        ) : (
          <ol className="mt-5 flex flex-col">
            {data.schedules.map((schedule, index) => {
              const period = parsePeriod(schedule.period);
              const last = index === data.schedules.length - 1;

              return (
                <li key={`${schedule.title}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'mt-1.5 size-2.5 shrink-0 rounded-full',
                        period.state === 'ongoing'
                          ? 'bg-brand-500 ring-4 ring-brand-100'
                          : period.state === 'past'
                            ? 'bg-ink-300'
                            : 'border-2 border-ink-300 bg-surface',
                      )}
                    />
                    {!last && <span className="w-px flex-1 bg-ink-100" />}
                  </div>

                  <div className={cn('flex flex-1 flex-wrap items-center gap-2', last ? 'pb-0' : 'pb-6')}>
                    <span
                      className={cn(
                        'text-body',
                        period.state === 'past' ? 'text-ink-500' : 'font-medium text-ink-900',
                      )}
                    >
                      {schedule.title}
                    </span>
                    {period.label && <span className="text-caption text-ink-500">{period.label}</span>}
                    {period.state && (
                      <Badge
                        tone={
                          period.state === 'ongoing'
                            ? 'brand'
                            : period.state === 'past'
                              ? 'neutral'
                              : 'info'
                        }
                      >
                        {scheduleStateLabel(period.state)}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="rounded-lg border border-ink-100 bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h2 text-ink-900">제출 서류 체크리스트</h2>
          <span className="text-body text-ink-500">
            {progress.done}/{progress.total} 완료
          </span>
        </div>

        <ProgressBar className="mt-3" value={progress.percent} showValue />

        {data.requiredDocuments.length === 0 ? (
          <p className="mt-4 text-body text-ink-500">등록된 제출 서류가 없어요.</p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {data.requiredDocuments.map((document) => (
              <li key={document.id}>
                <Checkbox
                  label={document.text}
                  checked={document.checkedByMe}
                  onChange={(event) => onToggle(document.id, event.target.checked)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.eligibility.length > 0 && (
        <section className="rounded-lg border border-ink-100 bg-surface p-6">
          <h2 className="text-h2 text-ink-900">지원 자격</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {data.eligibility.map((item) => (
              <li key={item} className="text-body text-ink-700">
                · {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* partnerSchools · tips · blogLinks는 Phase 2라 렌더링하지 않는다 */}
    </div>
  );
}
