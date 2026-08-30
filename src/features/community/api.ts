'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch, post, put } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  CursorPage,
  FreePostCommentRequest,
  FreePostCommentResponse,
  FreePostDetailResponse,
  FreePostLikeResponse,
  FreePostRequest,
  FreePostSummaryResponse,
} from '@/shared/api/types';
import { useCursorInfinite, type CursorPageParams } from '@/shared/hooks/useCursorInfinite';
import { communityEndpoint, type CommunityTab } from '@/entities/community/tab';

/* ─────────── 목록 ─────────── */

export function useCommunityList(tab: CommunityTab, keyword: string) {
  const trimmed = keyword.trim();

  return useCursorInfinite<FreePostSummaryResponse>({
    queryKey: queryKeys.community.list(tab, { keyword: trimmed }),
    fetchPage: ({ cursorId, size }: CursorPageParams) =>
      get<CursorPage<FreePostSummaryResponse>>(communityEndpoint(tab, trimmed), {
        cursorId,
        size,
        ...(trimmed === '' ? {} : { keyword: trimmed }),
      }),
  });
}

/** 마이페이지에서 쓰는 내 글·스크랩·좋아요 목록 */
export function useMyCommunityList(scope: 'my' | 'scraps' | 'liked', enabled = true) {
  const path = {
    my: endpoints.freePost.my,
    scraps: endpoints.freePost.scraps,
    liked: endpoints.freePost.liked,
  }[scope];

  const key = {
    my: queryKeys.community.my(),
    scraps: queryKeys.community.scraps(),
    liked: queryKeys.community.liked(),
  }[scope];

  return useCursorInfinite<FreePostSummaryResponse>({
    queryKey: key,
    enabled,
    fetchPage: ({ cursorId, size }) =>
      get<CursorPage<FreePostSummaryResponse>>(path, { cursorId, size }),
  });
}

export function usePopularPosts() {
  return useQuery({
    queryKey: queryKeys.community.popular(),
    queryFn: () => get<FreePostSummaryResponse[]>(endpoints.freePost.popular),
    staleTime: 5 * 60 * 1000,
  });
}

/* ─────────── 상세 ─────────── */

export function useFreePost(postId: number) {
  return useQuery({
    queryKey: queryKeys.community.detail(postId),
    queryFn: () => get<FreePostDetailResponse>(endpoints.freePost.detail(postId)),
    enabled: Number.isInteger(postId) && postId > 0,
  });
}

/* ─────────── 작성·수정·삭제 ─────────── */

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FreePostRequest) => post<number>(endpoints.freePost.create, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
    },
  });
}

export function useUpdatePost(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FreePostRequest) => put<void>(endpoints.freePost.detail(postId), body),
    onSuccess: () => {
      // 목록 카드에도 제목·미리보기가 나가므로 커뮤니티 도메인 전체를 다시 받는다
      void queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => del<void>(endpoints.freePost.detail(postId)),
    onSuccess: (_data, postId) => {
      queryClient.removeQueries({ queryKey: queryKeys.community.detail(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.community.all() });
    },
  });
}

/* ─────────── 좋아요 · 스크랩 ─────────── */

/** 응답이 오기 전에 먼저 반영하고, 실패하면 이전 값으로 되돌린다 */
export function useToggleLike(postId: number) {
  const queryClient = useQueryClient();
  const key = queryKeys.community.detail(postId);

  return useMutation({
    mutationFn: () => post<FreePostLikeResponse>(endpoints.freePost.like(postId)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FreePostDetailResponse>(key);

      if (previous) {
        queryClient.setQueryData<FreePostDetailResponse>(key, {
          ...previous,
          liked: !previous.liked,
          likeCount: previous.likeCount + (previous.liked ? -1 : 1),
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (result) => {
      const current = queryClient.getQueryData<FreePostDetailResponse>(key);
      if (current) {
        queryClient.setQueryData<FreePostDetailResponse>(key, {
          ...current,
          liked: result.liked,
          likeCount: result.likeCount,
        });
      }
    },
  });
}

export function useToggleScrap(postId: number) {
  const queryClient = useQueryClient();
  const key = queryKeys.community.detail(postId);

  return useMutation({
    mutationFn: () => post<boolean>(endpoints.freePost.scrap(postId)),
    onSuccess: (scrapped) => {
      const current = queryClient.getQueryData<FreePostDetailResponse>(key);
      if (current) {
        queryClient.setQueryData<FreePostDetailResponse>(key, {
          ...current,
          scrapCount: Math.max(0, current.scrapCount + (scrapped ? 1 : -1)),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.community.scraps() });
    },
  });
}

/* ─────────── 댓글 ─────────── */

/**
 * 댓글 조회 API가 따로 없고 상세 응답에 함께 오므로,
 * 작성·수정·삭제 후에는 상세를 다시 받아 목록을 갱신한다.
 */
function useCommentMutation<TVariables>(
  postId: number,
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(postId) });
    },
  });
}

export function useCreateComment(postId: number) {
  return useCommentMutation<FreePostCommentRequest>(postId, (body) =>
    post<FreePostCommentResponse>(endpoints.freePost.comments(postId), body),
  );
}

export function useUpdateComment(postId: number) {
  return useCommentMutation<{ commentId: number; content: string }>(postId, ({ commentId, content }) =>
    patch<FreePostCommentResponse>(endpoints.freePost.comment(postId, commentId), { content }),
  );
}

export function useDeleteComment(postId: number) {
  return useCommentMutation<number>(postId, (commentId) =>
    del<void>(endpoints.freePost.comment(postId, commentId)),
  );
}
