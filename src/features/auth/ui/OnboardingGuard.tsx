'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/shared/store/authStore';
import { useToast } from '@/shared/ui/Toast';

import { SessionGate } from './SessionGate';

type Decision = 'pending' | 'allow' | 'leaving';

/**
 * 온보딩 전용 가드.
 *
 * 진입 시점의 status로 한 번만 판단한다. 온보딩을 마치면 status가 ACTIVE로 바뀌는데,
 * 그때마다 다시 판단하면 완료 화면이 홈으로 튕겨 나가기 때문이다.
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const toast = useToast();

  const phase = useAuthStore((state) => state.phase);
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);
  const clear = useAuthStore((state) => state.clear);

  const [decision, setDecision] = useState<Decision>('pending');

  useEffect(() => {
    if (phase !== 'ready' || decision !== 'pending') return;

    if (accessToken === null) {
      setDecision('leaving');
      router.replace('/login?redirectTo=%2Fonboarding');
      return;
    }

    if (status === 'NEED_SIGNUP') {
      setDecision('leaving');
      clear();
      toast.error('지원하지 않는 계정입니다.');
      router.replace('/');
      return;
    }

    if (status === 'ACTIVE') {
      setDecision('leaving');
      router.replace('/home');
      return;
    }

    setDecision('allow');
  }, [accessToken, clear, decision, phase, router, status, toast]);

  if (decision !== 'allow') return <SessionGate />;

  return <>{children}</>;
}
