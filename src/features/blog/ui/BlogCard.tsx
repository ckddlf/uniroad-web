import Link from 'next/link';
import { Heart } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/date';

/**
 * 목록 카드가 필요로 하는 최소 정보.
 * 저장된 글(BlogPostSummaryResponse)과 아직 저장 전인 작성 폼 양쪽이 이 모양을 만들 수 있어서,
 * 목록과 미리보기가 같은 컴포넌트를 쓰게 된다.
 */
export interface BlogCardData {
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  authorNickname: string | null;
  publishedAt: string | null;
  createdAt?: string | null;
  likeCount: number;
  likedByMe?: boolean;
}

export interface BlogCardProps {
  post: BlogCardData;
  /** 없으면 링크가 아니라 그냥 카드로 그린다 (미리보기) */
  href?: string;
  className?: string;
}

export function BlogCard({ post, href, className }: BlogCardProps) {
  const date = post.publishedAt ?? post.createdAt ?? null;

  const body = (
    <>
      <div className="aspect-[16/10] w-full overflow-hidden bg-canvas">
        {post.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- 썸네일 주소가 remotePatterns 밖일 수 있어, next/image의 런타임 오류 대신 일반 img를 쓴다 */
          <img
            src={post.thumbnailUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-caption text-ink-300">
            이미지 없음
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-h2 text-ink-900 text-balance line-clamp-2-safe">
          {post.title === '' ? '제목 없음' : post.title}
        </h3>

        <p className="line-clamp-2-safe text-body text-ink-500">
          {post.summary === null || post.summary === '' ? '내용을 입력하면 요약이 채워져요.' : post.summary}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="truncate text-caption text-ink-500">
            {date === null ? '아직 공개 전' : formatDate(date, 'yyyy년 M월 d일')}
            {post.authorNickname ? ` · ${post.authorNickname}` : ''}
          </p>

          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 text-caption',
              post.likedByMe ? 'text-brand-600' : 'text-ink-500',
            )}
          >
            <Heart
              aria-hidden
              className={cn('size-4', post.likedByMe && 'fill-current')}
            />
            {post.likeCount}
          </span>
        </div>
      </div>
    </>
  );

  const shared = cn(
    'group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-surface shadow-card',
    className,
  );

  if (href === undefined) {
    return <article className={shared}>{body}</article>;
  }

  return (
    <Link href={href} className={cn(shared, 'transition-shadow hover:shadow-pop')}>
      {body}
    </Link>
  );
}
