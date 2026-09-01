'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import type { LoginRequest, OnboardingRequest, SignUpRequest, TokenResponse } from '@/shared/api/types';
import { useAuthStore } from '@/shared/store/authStore';

import { authApi } from '../api';

export interface LoginVariables extends LoginRequest {
  /** 체크 시 refreshToken을 localStorage에, 아니면 sessionStorage에 둔다 */
  remember: boolean;
}

/** 로그인 후 이동은 화면마다 달라서 여기서 하지 않는다 (status 분기는 호출부 몫) */
export function useLogin() {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setMember = useAuthStore((state) => state.setMember);

  return useMutation<TokenResponse, unknown, LoginVariables>({
    mutationFn: ({ username, password }) => authApi.login({ username, password }),
    onSuccess: async (token, { remember }) => {
      setTokens(token, remember);

      // 온보딩 전 회원은 프로필이 비어 있어 굳이 조회하지 않는다
      if (token.status === 'ACTIVE') {
        try {
          setMember(await authApi.me());
        } catch {
          /* 회원 정보는 각 화면에서 다시 조회하므로 여기서는 넘어간다 */
        }
      }
    },
  });
}

/**
 * 가입 응답에는 토큰이 없어서, 방금 입력한 아이디/비밀번호로 로그인까지 이어서 수행한다.
 * 자동 로그인이 실패하면 `autoLoggedIn: false`로 알려 호출부가 /login으로 보낸다.
 */
export function useSignUp() {
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation<{ memberId: number; autoLoggedIn: boolean }, unknown, SignUpRequest>({
    mutationFn: async (body) => {
      const memberId = await authApi.signUp(body);

      try {
        const token = await authApi.login({ username: body.username, password: body.password });
        setTokens(token, false);
        return { memberId, autoLoggedIn: true };
      } catch {
        return { memberId, autoLoggedIn: false };
      }
    },
  });
}

export function useOnboarding() {
  return useMutation<void, unknown, OnboardingRequest>({
    mutationFn: (body) => authApi.onboarding(body),
  });
}

/** 온보딩·인증 승인 후처럼 role·status가 바뀌었을 때 전역 상태를 갱신한다 */
export function useRefreshMember() {
  const setMember = useAuthStore((state) => state.setMember);
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const member = await authApi.me();
    setMember(member);
    queryClient.setQueryData(queryKeys.member.me(), member);
    return member;
  }, [queryClient, setMember]);
}

export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((state) => state.clear);
  const beginLogout = useAuthStore((state) => state.beginLogout);
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // 세션을 비우기 전에 표시해둔다. 그러지 않으면 (app) 레이아웃의 AuthGuard가
    // 토큰이 사라진 것을 먼저 보고 /login으로 튕겨 홈 이동을 덮어쓴다.
    beginLogout();

    try {
      await authApi.logout();
    } catch {
      // 서버 로그아웃이 실패해도 로컬 세션은 반드시 정리한다
    }

    clear();
    queryClient.clear();
    router.replace('/');
  }, [beginLogout, clear, queryClient, router]);
}
