'use client';

import Link from 'next/link';

import { RoleBadge } from '@/entities/member/ui/RoleBadge';
import { formatDispatchSummary, selectDdayTarget } from '@/entities/member/dday';
import { useMyVerifications } from '@/features/verification/api';
import { CURRENT_SITUATION, VERIFICATION_STATUS } from '@/shared/lib/constants';
import { displayName } from '@/shared/lib/format';
import { useAuthStore } from '@/shared/store/authStore';
import { Avatar, Badge, buttonClass, Skeleton } from '@/shared/ui';

export function MyProfileSummary() {
  const member = useAuthStore((state) => state.member);
  const verifications = useMyVerifications();

  if (!member) return <Skeleton className="h-40 w-full" />;

  const dday = selectDdayTarget(member);
  const summary = formatDispatchSummary(member);
  const latest = verifications.data?.[0] ?? null;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-surface p-6 sm:flex-row sm:items-center">
        <Avatar name={displayName(member.nickname, member.name)} size="lg" />

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-h2 text-ink-900">{displayName(member.nickname, member.name)}</span>
            <RoleBadge role={member.role} />
          </div>

          <p className="text-body text-ink-500">{summary ?? '파견 정보가 아직 없어요.'}</p>

          <p className="text-caption text-ink-500">
            {member.currentSituation ? CURRENT_SITUATION[member.currentSituation] : '단계 미설정'}
            {dday && ` · ${dday.label} ${dday.text}`}
          </p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 bg-surface p-6">
        <div className="flex flex-col gap-1">
          <p className="text-label font-medium text-ink-700">교환학생 인증</p>

          {verifications.isPending ? (
            <Skeleton className="h-5 w-24" />
          ) : latest ? (
            <div className="flex items-center gap-2">
              <Badge
                tone={
                  latest.status === 'APPROVED'
                    ? 'brand'
                    : latest.status === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                }
              >
                {VERIFICATION_STATUS[latest.status]}
              </Badge>
              {latest.status === 'REJECTED' && latest.rejectReason && (
                <span className="text-caption text-ink-500">{latest.rejectReason}</span>
              )}
            </div>
          ) : (
            <p className="text-body text-ink-500">아직 제출하지 않았어요.</p>
          )}
        </div>

        <Link href="/verification" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
          인증 화면으로
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { href: '/my/posts', label: '내가 쓴 글' },
          { href: '/my/scraps', label: '스크랩' },
          { href: '/my/likes', label: '좋아요한 글' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-ink-100 bg-surface p-5 text-body text-ink-900 transition-colors hover:border-ink-300"
          >
            {item.label} →
          </Link>
        ))}
      </section>

      {/* TODO(api): 도메인별 내 글 개수를 한 번에 주는 API가 없어 숫자 대신 링크만 둔다 */}
    </div>
  );
}
