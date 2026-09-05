'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  BlogPostDetailResponse,
  BlogPostLikeResponse,
  BlogPostRequest,
  BlogPostSummaryResponse,
} from '@/shared/api/types';

/* ─────────── 공개 ─────────── */

export function useBlogPost(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.blog.detail(slug),
    queryFn: () => get<BlogPostDetailResponse>(endpoints.blog.detail(slug)),
    enabled: enabled && slug !== '',
  });
}

/**
 * 좋아요는 누른 즉시 반응해야 한다.
 * 서버 응답을 기다리지 않고 화면을 먼저 바꾸고, 실패하면 되돌린다.
 */
export function useBlogLike(slug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => post<BlogPostLikeResponse>(endpoints.blog.like(postId)),
    onSuccess: (result) => {
      if (slug) {
        queryClient.setQueryData<BlogPostDetailResponse>(queryKeys.blog.detail(slug), (previous) =>
          previous
            ? { ...previous, liked: result.liked, likeCount: result.likeCount, likedByMe: result.liked }
            : previous,
        );
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.blog.list() });
    },
  });
}

/* ─────────── 관리자 ─────────── */

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: queryKeys.blog.adminList(),
    queryFn: () => get<BlogPostSummaryResponse[]>(endpoints.adminBlog.list),
  });
}

export function useAdminBlogPost(postId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.blog.adminDetail(postId),
    queryFn: () => get<BlogPostDetailResponse>(endpoints.adminBlog.detail(postId)),
    enabled: enabled && Number.isFinite(postId),
  });
}

export function useAdminBlogMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.blog.all() });
  };

  const create = useMutation({
    mutationFn: (body: BlogPostRequest) =>
      post<BlogPostDetailResponse>(endpoints.adminBlog.create, body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ postId, ...body }: BlogPostRequest & { postId: number }) =>
      patch<BlogPostDetailResponse>(endpoints.adminBlog.update(postId), body),
    onSuccess: invalidate,
  });

  const setPublished = useMutation({
    mutationFn: ({ postId, published }: { postId: number; published: boolean }) =>
      post<BlogPostDetailResponse>(
        published ? endpoints.adminBlog.publish(postId) : endpoints.adminBlog.unpublish(postId),
      ),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (postId: number) => del<void>(endpoints.adminBlog.remove(postId)),
    onSuccess: invalidate,
  });

  return { create, update, setPublished, remove };
}
