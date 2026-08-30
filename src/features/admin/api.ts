'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { del, get, patch, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  AdminDashboardResponse,
  AdminReportUpdateRequest,
  AdminVerificationResponse,
  MemberResponseDto,
  NoticeRequest,
  NoticeResponse,
  ReportResponse,
  Role,
  VerificationStatus,
} from '@/shared/api/types';

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => get<AdminDashboardResponse>(endpoints.admin.dashboard),
  });
}

/* ─────────── 회원 ─────────── */

export function useAdminMembers() {
  return useQuery({
    queryKey: queryKeys.admin.members(),
    // TODO(api): 페이징이 없어 전체 회원이 한 번에 온다. 화면에서 검색·페이징으로 처리한다.
    queryFn: () => get<MemberResponseDto[]>(endpoints.admin.members),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: Role }) =>
      patch<MemberResponseDto>(endpoints.admin.memberRole(memberId), { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.members() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => del<void>(endpoints.admin.member(memberId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.members() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    },
  });
}

/* ─────────── 인증 심사 ─────────── */

export function useAdminVerifications(status: VerificationStatus) {
  const path = {
    PENDING: endpoints.verification.pending,
    APPROVED: endpoints.verification.approved,
    REJECTED: endpoints.verification.rejected,
  }[status];

  const key = {
    PENDING: queryKeys.verification.pending(),
    APPROVED: queryKeys.verification.approved(),
    REJECTED: queryKeys.verification.rejected(),
  }[status];

  return useQuery({
    queryKey: key,
    queryFn: () => get<AdminVerificationResponse[]>(path),
  });
}

export function useReviewVerification() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['verification'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.members() });
  };

  const approve = useMutation({
    mutationFn: (id: number) => post<void>(endpoints.verification.approve(id)),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      post<void>(endpoints.verification.reject(id), { reason }),
    onSuccess: invalidate,
  });

  return { approve, reject };
}

/* ─────────── 신고 ─────────── */

export function useAdminReports() {
  return useQuery({
    queryKey: queryKeys.admin.reports(),
    // TODO(api): 신고 목록에도 페이징이 없다
    queryFn: () => get<ReportResponse[]>(endpoints.admin.reports),
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: AdminReportUpdateRequest & { id: number }) =>
      patch<ReportResponse>(endpoints.admin.report(id), body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    },
  });
}

/* ─────────── 공지 ─────────── */

export function useAdminNotices() {
  return useQuery({
    queryKey: queryKeys.notice.list(),
    queryFn: () => get<NoticeResponse[]>(endpoints.notice.list),
  });
}

export function useNoticeMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.notice.list() });
  };

  const create = useMutation({
    mutationFn: (body: NoticeRequest) => post<NoticeResponse>(endpoints.notice.create, body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ noticeId, ...body }: NoticeRequest & { noticeId: number }) =>
      patch<NoticeResponse>(endpoints.notice.update(noticeId), body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (noticeId: number) => del<void>(endpoints.notice.remove(noticeId)),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
