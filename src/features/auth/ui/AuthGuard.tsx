'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import type { MemberStatus, Role } from '@/shared/api/types';
import { useAuthStore } from '@/shared/store/authStore';
import { useToast } from '@/shared/ui/Toast';

import { SessionGate } from './SessionGate';

export interface AuthGuardProps {
  /** 이 영역에 들어오려면 필요한 가입 퍼널 단계 */
  require: Extract<MemberStatus, 'ACTIVE' | 'NEED_ONBOARDING'>;
  /** 기능 권한까지 확인할 때만 지정 (관리자 콘솔) */
  role?: Role;
  children: ReactNode;
}

/**
 * 라우트 그룹 레이아웃에 붙는 클라이언트 가드.
 * accessToken이 메모리에 있어 Edge middleware에서는 읽을 수 없으므로 middleware를 쓰지 않는다.
 */
export function AuthGuard({ require, role, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const phase = useAuthStore((state) => state.phase);
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);
  const currentRole = useAuthStore((state) => state.role);
  const clear = useAuthStore((state) => state.clear);

  const authenticated = accessToken !== null;
  const statusOk = status === require;
  const roleOk = role === undefined || currentRole === role;
  const allowed = authenticated && statusOk && roleOk;

  useEffect(() => {
    // 세션 복원이 끝나기 전에는 어떤 판단도 하지 않는다
    if (phase !== 'ready' || allowed) return;

    if (!authenticated) {
      const redirect = pathname ? `?redirectTo=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirect}`);
      return;
    }

    // 소셜 로그인 전용 상태 — Phase 1에서는 나오지 않지만 방어적으로 처리한다
    if (status === 'NEED_SIGNUP') {
      clear();
      toast.error('지원하지 않는 계정입니다.');
      router.replace('/');
      return;
    }

    if (status === 'NEED_ONBOARDING') {
      router.replace('/onboarding');
      return;
    }

    if (!roleOk) {
      toast.error('접근 권한이 없습니다.');
      router.replace('/home');
      return;
    }

    router.replace('/home');
  }, [allowed, authenticated, clear, pathname, phase, roleOk, router, status, toast]);

  if (phase !== 'ready' || !allowed) return <SessionGate />;

  return <>{children}</>;
}
