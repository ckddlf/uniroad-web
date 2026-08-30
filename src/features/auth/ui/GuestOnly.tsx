'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/shared/store/authStore';

/**
 * 로그인·회원가입·랜딩처럼 이미 로그인한 사용자에게는 의미가 없는 화면을 감싼다.
 * 검색 노출을 위해 서버 렌더 결과는 그대로 두고, 판단이 끝난 뒤에만 클라이언트에서 이동시킨다.
 * (공지처럼 누구나 볼 수 있어야 하는 공개 화면에는 붙이지 않는다.)
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const phase = useAuthStore((state) => state.phase);
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (phase !== 'ready' || accessToken === null) return;

    router.replace(status === 'NEED_ONBOARDING' ? '/onboarding' : '/home');
  }, [accessToken, phase, router, status]);

  return <>{children}</>;
}
