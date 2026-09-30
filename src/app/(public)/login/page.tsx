import { Suspense } from 'react';
import type { Metadata } from 'next';

import { GuestOnly } from '@/features/auth/ui/GuestOnly';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { pageMetadata } from '@/shared/lib/site';
import { AuthShell } from '@/widgets/auth/AuthShell';
import { Skeleton } from '@/shared/ui';

export const metadata: Metadata = pageMetadata({
  title: '로그인',
  description:
    'UNIROAD에 로그인하고 교환학생 준비 일정과 커뮤니티, 중고거래·티켓 양도·동행 게시판을 이어서 이용하세요.',
  path: '/login',
});

export default function LoginPage() {
  return (
    <GuestOnly>
      <AuthShell title="다시 오셨네요" description="아이디와 비밀번호로 로그인해주세요.">
        {/* useSearchParams(redirectTo)를 쓰므로 Suspense 경계가 필요하다 */}
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <LoginForm />
        </Suspense>
      </AuthShell>
    </GuestOnly>
  );
}
