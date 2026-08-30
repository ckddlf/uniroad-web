import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';

import type { FreePostSummaryResponse } from '@/shared/api/types';
import { formatRelative } from '@/shared/lib/date';
import { displayName, formatNumber } from '@/shared/lib/format';
import { Badge } from '@/shared/ui';

export function PostCard({ post }: { post: FreePostSummaryResponse }) {
  return (
    <li className="border-b border-ink-100">
      <Link
        href={`/community/${post.id}`}
        className="flex gap-4 px-1 py-5 transition-colors hover:bg-ink-100/40"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {post.country && <Badge tone="brand">{post.country}</Badge>}
            <span className="truncate text-caption text-ink-500">
              {/* TODO(api): 목록 DTO에 작성자 role이 없어 인증 뱃지를 표시할 수 없다 */}
              {displayName(post.authorNickname, post.authorName)}
            </span>
            <span aria-hidden className="text-ink-300">
              ·
            </span>
            <span className="shrink-0 text-caption text-ink-500">
              {formatRelative(post.createdAt)}
            </span>
          </div>

          <h3 className="truncate text-body font-medium text-ink-900">{post.title}</h3>
          <p className="line-clamp-2-safe text-body text-ink-500">{post.preview}</p>

          <div className="mt-1 flex items-center gap-3 text-caption text-ink-500">
            <span className="inline-flex items-center gap-1">
              <Heart aria-hidden className="size-3.5" />
              {formatNumber(post.likeCount)}
              <span className="sr-only">좋아요</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle aria-hidden className="size-3.5" />
              {formatNumber(post.commentCount)}
              <span className="sr-only">댓글</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Bookmark aria-hidden className="size-3.5" />
              {formatNumber(post.scrapCount)}
              <span className="sr-only">스크랩</span>
            </span>
          </div>
        </div>

        {post.thumbnailImageUrl && (
          <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-ink-100">
            <Image
              src={post.thumbnailImageUrl}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        )}
      </Link>
    </li>
  );
}
