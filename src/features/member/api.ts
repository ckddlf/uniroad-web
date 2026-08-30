'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { del, patch } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  MemberProfileUpdateRequest,
  MemberResponseDto,
  PasswordUpdateRequest,
} from '@/shared/api/types';
import { useAuthStore } from '@/shared/store/authStore';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setMember = useAuthStore((state) => state.setMember);

  return useMutation({
    mutationFn: (body: MemberProfileUpdateRequest) =>
      patch<MemberResponseDto>(endpoints.member.profile, body),
    onSuccess: (member) => {
      setMember(member);
      queryClient.setQueryData(queryKeys.member.me(), member);
      // 학교가 바뀌면 국제처 일정도 달라진다
      void queryClient.invalidateQueries({ queryKey: queryKeys.schedule.exchangeInfo() });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (body: PasswordUpdateRequest) => patch<void>(endpoints.member.password, body),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => del<void>(endpoints.member.me),
  });
}
