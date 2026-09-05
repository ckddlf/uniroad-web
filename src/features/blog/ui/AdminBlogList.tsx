'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Plus } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import type { BlogPostSummaryResponse } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/date';
import { Badge, Button, EmptyState, ErrorState, Modal, Skeleton, useToast } from '@/shared/ui';

import { useAdminBlogMutations, useAdminBlogPosts } from '../api';

export function AdminBlogList() {
  const toast = useToast();
  const posts = useAdminBlogPosts();
  const { setPublished, remove } = useAdminBlogMutations();
  const [deleting, setDeleting] = useState<BlogPostSummaryResponse | null>(null);

  if (posts.isPending) return <Skeleton className="h-96 w-full" />;
  if (posts.isError) {
    return <ErrorState error={posts.error} onRetry={() => void posts.refetch()} />;
  }

  const togglePublish = (post: BlogPostSummaryResponse) => {
    const next = post.status !== 'PUBLISHED';
    setPublished.mutate(
      { postId: post.id, published: next },
      {
        onSuccess: () => toast.success(next ? '글을 공개했어요.' : '초안으로 내렸어요.'),
        onError: (error) => toast.error(toErrorMessage(error)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 text-ink-900">블로그</h1>
        <Link href="/admin/blog/write">
          <Button leftIcon={<Plus aria-hidden className="size-4" />}>새 글 쓰기</Button>
        </Link>
      </div>

      {posts.data.length === 0 ? (
        <EmptyState title="아직 쓴 글이 없어요" description="첫 글을 써보세요." />
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 rounded-lg border border-ink-100 bg-surface">
          {posts.data.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone={post.status === 'PUBLISHED' ? 'brand' : 'neutral'}>
                    {post.status === 'PUBLISHED' ? '공개' : '초안'}
                  </Badge>
                  <p className="truncate text-body text-ink-900">{post.title}</p>
                </div>
                <p className="mt-1 truncate text-caption text-ink-500">
                  /blog/{post.slug} · {formatDateTime(post.createdAt)} · 조회 {post.viewCount} ·
                  좋아요 {post.likeCount}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.status === 'PUBLISHED' && (
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<ExternalLink aria-hidden className="size-4" />}
                    >
                      보기
                    </Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => togglePublish(post)}
                  loading={setPublished.isPending}
                >
                  {post.status === 'PUBLISHED' ? '내리기' : '공개'}
                </Button>
                <Link href={`/admin/blog/${post.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    수정
                  </Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => setDeleting(post)}>
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="글을 삭제할까요?"
        description={`"${deleting?.title ?? ''}" 글과 좋아요 기록이 함께 지워집니다. 되돌릴 수 없어요.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={() => {
                if (!deleting) return;
                remove.mutate(deleting.id, {
                  onSuccess: () => {
                    setDeleting(null);
                    toast.success('글을 삭제했어요.');
                  },
                  onError: (error) => toast.error(toErrorMessage(error)),
                });
              }}
            >
              삭제
            </Button>
          </>
        }
      />
    </div>
  );
}
