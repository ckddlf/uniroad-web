'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  BlogPostDetailResponse,
  BlogPostLikeResponse,
  BlogPostRequest,
  BlogPostSummaryResponse,
  CursorPage,
} from '@/shared/api/types';

/* ─────────── 공개 ─────────── */

/**
 * 공개된 글 목록. 블로그 페이지 첫 화면은 서버에서 그리므로(검색 노출),
 * 이 훅은 홈 위젯처럼 클라이언트에서 몇 개만 꺼내 보여줄 때 쓴다.
 */
export function useBlogPosts(size = 4) {
  return useQuery({
    queryKey: [...queryKeys.blog.list(), size],
    queryFn: () => get<CursorPage<BlogPostSummaryResponse>>(endpoints.blog.list, { size }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 목록에 붙일 "내 좋아요" 상태.
 *
 * 목록·상세는 검색 노출을 위해 서버에서 그리는데, 그 요청에는 토큰이 실리지 않고
 * 응답은 ISR 캐시까지 탄다(shared/api/server.ts). 그래서 서버가 내려준 카드의
 * likedByMe는 누구에게나 false이고, 새로고침해도 그 값은 영원히 바뀌지 않는다.
 * 로그인한 사람에게만 같은 목록을 본인 토큰으로 한 번 더 받아 하트와 숫자를 덮어쓴다.
 *
 * 글 내용까지 바꿔치지 않는 이유는, 서버가 그린 제목·요약이 크롤러가 본 것과 같아야 하고
 * 내용이 뒤늦게 갈리면 화면이 한 번 흔들리기 때문이다.
 *
 * staleTime을 두지 않는다 — 사람마다 다른 값이라 마운트할 때마다 확인해야 한다.
 */
export function useBlogLikeStates(size: number, enabled: boolean) {
  const query = useQuery({
    queryKey: [...queryKeys.blog.list(), 'like-state', size],
    queryFn: () => get<CursorPage<BlogPostSummaryResponse>>(endpoints.blog.list, { size }),
    enabled: enabled && size > 0,
    staleTime: 0,
  });

  return useMemo(() => {
    const states = new Map<number, { likeCount: number; likedByMe: boolean }>();
    for (const post of query.data?.items ?? []) {
      states.set(post.id, { likeCount: post.likeCount, likedByMe: post.likedByMe });
    }
    return states;
  }, [query.data]);
}

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
