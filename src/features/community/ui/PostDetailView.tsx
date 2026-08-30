'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, ChevronLeft, Heart, Siren } from 'lucide-react';

import { isApiError, toErrorMessage } from '@/shared/api/errors';
import { cn } from '@/shared/lib/cn';
import { formatDateTime } from '@/shared/lib/date';
import { displayName, formatNumber } from '@/shared/lib/format';
import {
  Badge,
  Button,
  buttonClass,
  EmptyState,
  ErrorState,
  Modal,
  ReportModal,
  Skeleton,
  useToast,
} from '@/shared/ui';

import { useDeletePost, useFreePost, useToggleLike, useToggleScrap } from '../api';
import { CommentSection } from './CommentSection';

export function PostDetailView({ postId }: { postId: number }) {
  const router = useRouter();
  const toast = useToast();

  const post = useFreePost(postId);
  const toggleLike = useToggleLike(postId);
  const toggleScrap = useToggleScrap(postId);
  const deletePost = useDeletePost();

  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (post.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (post.isError) {
    if (isApiError(post.error) && post.error.status === 404) {
      return (
        <EmptyState
          title="삭제됐거나 없는 글이에요"
          action={
            <Link href="/community" className={buttonClass()}>
              커뮤니티로
            </Link>
          }
        />
      );
    }
    return <ErrorState error={post.error} onRetry={() => void post.refetch()} />;
  }

  const data = post.data;

  const remove = async () => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('글을 삭제했어요.');
      router.replace('/community');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <article className="flex flex-col gap-8">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 self-start text-caption text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft aria-hidden className="size-4" />
        커뮤니티
      </Link>

      <header className="flex flex-col gap-3 border-b border-ink-100 pb-5">
        <div className="flex items-center gap-2">
          {data.country && <Badge tone="brand">{data.country}</Badge>}
        </div>

        <h1 className="text-h1 text-ink-900">{data.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-caption text-ink-500">
            {displayName(data.authorNickname, data.authorName)} · {formatDateTime(data.createdAt)}
          </p>

          <div className="flex items-center gap-3">
            {data.mine ? (
              <>
                <Link
                  href={`/community/${postId}/edit`}
                  className="text-caption text-ink-500 underline-offset-2 hover:underline"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="text-caption text-danger underline-offset-2 hover:underline"
                >
                  삭제
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-1 text-caption text-ink-500 underline-offset-2 hover:underline"
              >
                <Siren aria-hidden className="size-3.5" />
                신고
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="text-body whitespace-pre-wrap text-ink-900">{data.content}</div>

      {data.imageUrls.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.imageUrls.map((url, index) => (
            <li key={url} className="relative overflow-hidden rounded-lg bg-ink-100">
              <Image
                src={url}
                alt={`첨부 이미지 ${index + 1}`}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 720px"
                className="h-auto w-full object-contain"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 border-y border-ink-100 py-4">
        <Button
          variant={data.liked ? 'primary' : 'secondary'}
          onClick={() => toggleLike.mutate()}
          aria-pressed={data.liked}
          leftIcon={<Heart aria-hidden className={cn('size-4', data.liked && 'fill-current')} />}
        >
          좋아요 {formatNumber(data.likeCount)}
        </Button>

        <Button
          variant="secondary"
          loading={toggleScrap.isPending}
          onClick={() => toggleScrap.mutate()}
          leftIcon={<Bookmark aria-hidden className="size-4" />}
        >
          스크랩 {formatNumber(data.scrapCount)}
        </Button>
      </div>

      <CommentSection postId={postId} comments={data.comments ?? []} />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="FREE_POST"
        targetId={postId}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="글을 삭제할까요?"
        description="삭제한 글과 댓글은 되돌릴 수 없어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="danger" loading={deletePost.isPending} onClick={() => void remove()}>
              삭제
            </Button>
          </>
        }
      />
    </article>
  );
}
