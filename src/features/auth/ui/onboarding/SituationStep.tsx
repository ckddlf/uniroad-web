'use client';

import { useFormContext } from 'react-hook-form';

import type { CurrentSituation } from '@/shared/api/types';
import { CURRENT_SITUATION, CURRENT_SITUATION_DESCRIPTION } from '@/shared/lib/constants';
import { SelectableCard } from '@/shared/ui/SelectableCard';

import type { OnboardingFormValues } from '../../model/onboardingSchema';

const OPTIONS: { value: CurrentSituation; icon: string }[] = [
  { value: 'PREPARING_APPLICATION', icon: '📝' },
  { value: 'PREPARING_DEPARTURE', icon: '✈️' },
  { value: 'DISPATCHED', icon: '🌍' },
];

/** 이 선택이 홈 대시보드 배치와 커뮤니티 기본 탭을 결정한다 */
export function SituationStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">현재 단계</legend>

      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((option) => (
          <SelectableCard
            key={option.value}
            value={option.value}
            icon={option.icon}
            title={CURRENT_SITUATION[option.value]}
            description={CURRENT_SITUATION_DESCRIPTION[option.value]}
            {...register('currentSituation')}
          />
        ))}
      </div>

      {errors.currentSituation && (
        <p role="alert" className="text-caption text-danger">
          지금 어떤 단계인지 선택해주세요.
        </p>
      )}

      <p className="text-caption text-ink-500">
        선택한 단계에 맞춰 홈 화면과 커뮤니티 게시판이 정리돼요. 나중에 마이페이지에서 바꿀 수 있어요.
      </p>
    </fieldset>
  );
}
