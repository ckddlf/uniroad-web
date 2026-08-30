import type { Metadata } from 'next';

import { GuestOnly } from '@/features/auth/ui/GuestOnly';
import { SignUpForm } from '@/features/auth/ui/SignUpForm';
import { AuthShell } from '@/widgets/auth/AuthShell';

export const metadata: Metadata = {
  title: '회원가입',
  description: '아이디와 비밀번호만으로 UIROAD를 시작하세요.',
};

export default function SignUpPage() {
  return (
    <GuestOnly>
      <AuthShell title="UIROAD 시작하기">
        <SignUpForm />
      </AuthShell>
    </GuestOnly>
  );
}
