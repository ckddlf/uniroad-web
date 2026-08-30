'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toErrorMessage } from '@/shared/api/errors';
import type { CurrentSituation } from '@/shared/api/types';
import { applyServerFieldErrors } from '@/shared/lib/form';
import { readJson, removeKey, writeJson } from '@/shared/lib/storage';
import { Button, StepProgress, useToast } from '@/shared/ui';

import { useOnboarding } from '../model/useAuthActions';
import {
  ONBOARDING_DEFAULTS,
  ONBOARDING_STEP_FIELDS,
  onboardingSchema,
  toOnboardingRequest,
  type OnboardingFormValues,
} from '../model/onboardingSchema';
import { CompleteStep } from './onboarding/CompleteStep';
import { ProfileStep } from './onboarding/ProfileStep';
import { ScheduleStep } from './onboarding/ScheduleStep';
import { SchoolStep } from './onboarding/SchoolStep';
import { SituationStep } from './onboarding/SituationStep';

const DRAFT_KEY = 'uniroad.onboardingDraft';
const STEPS = ['나를 소개해주세요', '지금 어떤 단계인가요?', '학교 정보', '일정'];
type Step = 1 | 2 | 3 | 4;

export function OnboardingForm() {
  const toast = useToast();
  const onboarding = useOnboarding();

  const [step, setStep] = useState<Step>(1);
  const [completed, setCompleted] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: ONBOARDING_DEFAULTS,
    mode: 'onBlur',
  });

  const { handleSubmit, reset, trigger, watch, setError } = form;

  // 새로고침에 대비해 입력값을 세션에 임시 저장한다 (마지막에 한 번에 전송)
  useEffect(() => {
    const draft = readJson<OnboardingFormValues>(DRAFT_KEY, 'session');
    if (draft) reset({ ...ONBOARDING_DEFAULTS, ...draft });
  }, [reset]);

  useEffect(() => {
    const subscription = watch((values) => writeJson(DRAFT_KEY, values, 'session'));
    return () => subscription.unsubscribe();
  }, [watch]);

  const situation = watch('currentSituation') as CurrentSituation | '';
  const nickname = watch('nickname');

  const goNext = async () => {
    const valid = await trigger(ONBOARDING_STEP_FIELDS[step]);
    if (!valid) return;
    setStep((current) => (current < 4 ? ((current + 1) as Step) : current));
  };

  const submit = handleSubmit(async (values) => {
    try {
      await onboarding.mutateAsync(toOnboardingRequest(values));
      removeKey(DRAFT_KEY, 'session');
      setCompleted(true);
    } catch (error) {
      if (applyServerFieldErrors(error, setError, ONBOARDING_STEP_FIELDS[3])) {
        setStep(3);
        return;
      }
      toast.error(toErrorMessage(error));
    }
  });

  if (completed) {
    return <CompleteStep nickname={nickname.trim() || '회원'} />;
  }

  return (
    <FormProvider {...form}>
      <StepProgress current={step} steps={STEPS} />

      <h1 className="mb-1 text-h1 text-ink-900">{STEPS[step - 1]}</h1>
      <p className="mb-8 text-body text-ink-500">{DESCRIPTIONS[step - 1]}</p>

      <form onSubmit={submit} noValidate>
        {step === 1 && <ProfileStep />}
        {step === 2 && <SituationStep />}
        {step === 3 && <SchoolStep />}
        {step === 4 && <ScheduleStep situation={situation} />}

        <div className="mt-10 flex gap-2">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              // 다음 버튼이 w-full이라 flex가 이 버튼을 글자 폭 아래로 눌러 세로로 접히던 것을 막는다
              className="shrink-0"
              onClick={() => setStep((current) => (current - 1) as Step)}
            >
              이전
            </Button>
          )}

          {step < 4 ? (
            <Button type="button" size="lg" fullWidth onClick={() => void goNext()}>
              다음
            </Button>
          ) : (
            <Button type="submit" size="lg" fullWidth loading={onboarding.isPending}>
              시작하기
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

const DESCRIPTIONS = [
  '커뮤니티에서 보여질 정보예요.',
  '단계에 맞춰 홈 화면과 게시판을 정리해드릴게요.',
  '같은 지역 회원을 찾을 때 쓰여요.',
  '입력하시면 D-day와 준비 일정을 알려드려요.',
];
