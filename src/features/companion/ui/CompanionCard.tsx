import Link from 'next/link';
import { Bookmark, CalendarDays, MapPin, Users } from 'lucide-react';

import { participantRatio, tripLength } from '@/entities/companion/trip';
import type { CompanionPostResponse } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { COMPANION_STATUS } from '@/shared/lib/constants';
import { formatDate, formatRelative } from '@/shared/lib/date';
import { formatNumber } from '@/shared/lib/format';
import { Badge, ProgressBar } from '@/shared/ui';

export function CompanionCard({ post }: { post: CompanionPostResponse }) {
  const days = tripLength(post.startDate, post.endDate);
  const recruiting = post.status === 'RECRUITING';

  return (
    <li>
      <Link
        href={`/companions/${post.id}`}
        className={cn(
          'flex h-full flex-col gap-3 rounded-lg border border-ink-100 bg-surface p-5 transition-colors hover:border-ink-300',
          !recruiting && 'opacity-60',
        )}
      >
        <div className="flex items-start gap-2">
          <Badge tone={recruiting ? 'brand' : 'neutral'}>
            {COMPANION_STATUS[post.status] ?? post.statusDescription}
          </Badge>
          <h3 className="line-clamp-2-safe flex-1 text-body font-medium text-ink-900">
            {post.title}
          </h3>
        </div>

        <p className="inline-flex items-center gap-1.5 text-caption text-ink-700">
          <MapPin aria-hidden className="size-3.5 text-ink-500" />
          {[post.country, post.region].filter(Boolean).join(' ')}
        </p>

        <p className="inline-flex items-center gap-1.5 text-caption text-ink-700">
          <CalendarDays aria-hidden className="size-3.5 text-ink-500" />
          {formatDate(post.startDate, 'yyyy-MM-dd')} ~ {formatDate(post.endDate, 'MM-dd')}
          {days !== null && <span className="text-ink-500">({days}일)</span>}
        </p>

        <div className="flex flex-col gap-1.5">
          <p className="inline-flex items-center gap-1.5 text-caption text-ink-700">
            <Users aria-hidden className="size-3.5 text-ink-500" />
            {post.currentParticipants}/{post.capacity}명
            {post.genderRatio && <span className="text-ink-500">· 성비 {post.genderRatio}</span>}
          </p>
          <ProgressBar value={participantRatio(post)} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-caption text-ink-500">
          {/* TODO(api): 응답에 작성자 닉네임·role이 없어 이름만 보여준다 */}
          <span className="truncate font-medium text-ink-700">{post.memberName}</span>

          <span className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Bookmark aria-hidden className="size-3.5" />
              {formatNumber(post.scrapCount)}
            </span>
            {formatRelative(post.createdAt)}
          </span>
        </div>
      </Link>
    </li>
  );
}
