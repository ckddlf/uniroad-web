import type { Metadata } from 'next';
import Link from 'next/link';

import { OnboardingForm } from '@/features/auth/ui/OnboardingForm';
import { Logo } from '@/shared/ui/Logo';

export const metadata: Metadata = { title: '파견 정보 입력' };
export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-6 py-12">
      <Link href="/" aria-label="UNIROAD 홈" className="mb-8 self-start">
        <Logo className="h-6" />
      </Link>

      <OnboardingForm />
    </main>
  );
}
