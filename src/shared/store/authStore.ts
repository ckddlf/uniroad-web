import { create } from 'zustand';

import { clearRefreshToken, readRememberMe, saveRefreshToken } from '@/shared/lib/storage';
import type { MemberResponseDto, MemberStatus, Role, TokenResponse } from '@/shared/api/types';

/**
 * 세션 복원 단계.
 * `pending`인 동안에는 어떤 리다이렉트도 실행하면 안 된다.
 * (새로고침 때 로그인 페이지로 튕기는 버그의 원인)
 */
export type AuthPhase = 'pending' | 'ready';

interface AuthState {
  phase: AuthPhase;
  /** XSS 노출을 줄이기 위해 메모리에만 보관한다 */
  accessToken: string | null;
  status: MemberStatus | null;
  role: Role | null;
  member: MemberResponseDto | null;
  /**
   * 사용자가 직접 누른 로그아웃이 진행 중인지.
   * 세션이 비는 순간 AuthGuard가 /login으로 되돌리는 것을 막는 표시다.
   */
  loggingOut: boolean;

  setTokens: (token: TokenResponse, remember?: boolean) => void;
  /** 재발급 결과처럼 저장소 정책을 유지한 채 토큰만 교체할 때 사용 */
  refreshTokens: (token: TokenResponse) => void;
  setMember: (member: MemberResponseDto) => void;
  setPhase: (phase: AuthPhase) => void;
  /** 로그아웃 시작을 알린다. AuthGuard가 한 번 소비하고 되돌린다. */
  beginLogout: () => void;
  endLogout: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  phase: 'pending',
  accessToken: null,
  status: null,
  role: null,
  member: null,
  loggingOut: false,

  setTokens: (token, remember = false) => {
    saveRefreshToken(token.refreshToken, remember);
    set({
      accessToken: token.accessToken,
      status: token.status,
      role: token.role,
      loggingOut: false,
    });
  },

  refreshTokens: (token) => {
    saveRefreshToken(token.refreshToken, readRememberMe());
    set({ accessToken: token.accessToken, status: token.status, role: token.role });
  },

  setMember: (member) =>
    set({ member, status: member.status, role: member.role }),

  setPhase: (phase) => set({ phase }),

  beginLogout: () => set({ loggingOut: true }),
  endLogout: () => set({ loggingOut: false }),

  // loggingOut은 여기서 건드리지 않는다 — clear() 뒤에도 표시가 살아 있어야
  // AuthGuard가 그것을 보고 /login 리다이렉트를 건너뛴다.
  clear: () => {
    clearRefreshToken();
    set({ accessToken: null, status: null, role: null, member: null });
  },
}));

/* ─── React 밖(axios 인터셉터 등)에서 쓰는 접근자 ─── */

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function applyRefreshedTokens(token: TokenResponse): void {
  useAuthStore.getState().refreshTokens(token);
}

export function clearSession(): void {
  useAuthStore.getState().clear();
}

/** 인증(로그인)만 끝난 상태인지 — 온보딩 완료 여부는 status로 따로 본다 */
export function selectIsAuthenticated(state: AuthState): boolean {
  return state.accessToken !== null;
}

export function selectIsVerified(state: AuthState): boolean {
  return state.role === 'VERIFIED' || state.role === 'ADMIN';
}

export function selectIsAdmin(state: AuthState): boolean {
  return state.role === 'ADMIN';
}
