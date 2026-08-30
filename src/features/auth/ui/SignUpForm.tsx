'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import type { SignUpRequest } from '@/shared/api/types';
import { StepProgress, useToast } from '@/shared/ui';

import { useSignUp } from '../model/useAuthActions';
import { AccountStep } from './signup/AccountStep';
import { TermsStep } from './signup/TermsStep';

const STEPS = ['약관 동의', '계정 정보', '가입 완료'];

export function SignUpForm() {
  const router = useRouter();
  const toast = useToast();
  const signUp = useSignUp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handleSignUp = async (values: SignUpRequest) => {
    try {
      const { autoLoggedIn } = await signUp.mutateAsync(values);
      setStep(3);

      // 가입 응답에는 토큰이 없어 방금 입력한 정보로 로그인까지 끝낸 뒤 온보딩으로 보낸다
      if (autoLoggedIn) {
        router.replace('/onboarding');
        return;
      }

      toast.info('가입이 완료되었습니다. 로그인해주세요.');
      router.replace('/login');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <>
      <StepProgress current={step} steps={STEPS} />

      {/* TODO(api): 약관·마케팅 수신 동의를 저장할 필드가 회원가입 요청에 없다 */}
      {step === 1 && <TermsStep onNext={() => setStep(2)} />}

      {step === 2 && (
        <AccountStep onSubmit={handleSignUp} onBack={() => setStep(1)} pending={signUp.isPending} />
      )}

      {step === 3 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Loader2 aria-hidden className="size-6 animate-spin text-brand-500" />
          <p className="text-h2 text-ink-900">가입 완료!</p>
          <p className="text-body text-ink-500">이제 파견 정보를 알려주세요.</p>
        </div>
      )}
    </>
  );
}
