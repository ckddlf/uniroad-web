'use client';

import Link from 'next/link';

import { useAuthStore } from '@/shared/store/authStore';
import { buttonClass } from '@/shared/ui/Button';

/**
 * 공개 페이지 헤더의 오른쪽 버튼.
 *
 * 블로그·FAQ·공지는 로그인한 사람도 본다. 그때도 "로그인 / 바로 시작하기"가 떠 있으면
 * 로그아웃된 것처럼 보이고, 앱으로 돌아갈 길도 로고(랜딩으로 감)밖에 없다.
 * 세션이 확인되면 그 자리를 "홈으로"가 대신한다.
 *
 * 세션 복원(phase)이 끝나기 전에는 자리만 잡아 둔다 — 먼저 그렸다가 바꾸면
 * 로그인한 사람에게 "로그인" 버튼이 한 번 번쩍인다.
 */
export function LandingHeaderActions() {
  const phase = useAuthStore((state) => state.phase);
  const signedIn = useAuthStore((state) => state.accessToken !== null);

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/notices"
        className="hidden rounded-md px-3 py-2 text-body text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:inline-flex"
      >
        공지사항
      </Link>

      {phase !== 'ready' ? (
        <span aria-hidden className="h-10 w-28" />
      ) : signedIn ? (
        <Link href="/home" className={buttonClass()}>
          홈으로
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className={buttonClass({ variant: 'ghost', className: 'hidden sm:inline-flex' })}
          >
            로그인
          </Link>
          <Link href="/signup" className={buttonClass()}>
            바로 시작하기
          </Link>
        </>
      )}
    </div>
  );
}
