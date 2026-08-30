'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { get, reissueOnce } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { setUnauthorizedHandler } from '@/shared/api/authEvents';
import type { MemberResponseDto } from '@/shared/api/types';
import { readRefreshToken } from '@/shared/lib/storage';
import { useAuthStore } from '@/shared/store/authStore';

/**
 * 앱 최초 마운트 시 저장된 refreshToken으로 세션을 복원한다.
 * 복원이 끝나기 전(phase === 'pending')에는 어떤 가드도 리다이렉트하면 안 된다.
 *
 * 여기서 화면을 가리지는 않는다. 랜딩·공지처럼 인증이 필요 없는 페이지는
 * 서버 렌더 결과가 그대로 보여야 검색 노출이 되기 때문이다.
 * 로그인이 필요한 영역의 전체 화면 로딩은 라우트 그룹 레이아웃의 가드가 담당한다.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setPhase = useAuthStore((state) => state.setPhase);
  const setMember = useAuthStore((state) => state.setMember);
  const clear = useAuthStore((state) => state.clear);

  // 인터셉터에서 세션이 끊겼을 때 쓰도록 현재 경로를 최신으로 들고 있는다
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    return setUnauthorizedHandler(() => {
      const current = pathnameRef.current;
      const redirect = current && current !== '/' ? `?redirectTo=${encodeURIComponent(current)}` : '';
      router.replace(`/login${redirect}`);
    });
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!readRefreshToken()) {
        if (!cancelled) setPhase('ready');
        return;
      }

      try {
        await reissueOnce();
        const member = await get<MemberResponseDto>(endpoints.member.me);
        if (!cancelled) setMember(member);
      } catch {
        // 만료·폐기된 토큰이면 조용히 비로그인 상태로 시작한다
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setPhase('ready');
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, [clear, setMember, setPhase]);

  return <>{children}</>;
}
