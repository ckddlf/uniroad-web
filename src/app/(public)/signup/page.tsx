import type { Metadata } from 'next';

import { GuestOnly } from '@/features/auth/ui/GuestOnly';
import { SignUpForm } from '@/features/auth/ui/SignUpForm';
import { pageMetadata } from '@/shared/lib/site';
import { Logo } from '@/shared/ui/Logo';
import { AuthShell } from '@/widgets/auth/AuthShell';

export const metadata: Metadata = pageMetadata({
  title: '회원가입',
  description:
    '아이디와 비밀번호만으로 가입하고 교환학생 준비 일정 체크리스트, 커뮤니티, 현지 중고거래·티켓 양도·동행 구하기를 UNIROAD에서 시작하세요.',
  path: '/signup',
});

export default function SignUpPage() {
  return (
    <GuestOnly>
      <AuthShell
        title={
          <>
            <Logo tone="ink" inline /> 시작하기
          </>
        }
      >
        <SignUpForm />
      </AuthShell>
    </GuestOnly>
  );
}
