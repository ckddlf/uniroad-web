'use client';

import { useFormContext } from 'react-hook-form';

import { GENDER } from '@/shared/lib/constants';
import { Input, Radio, RadioGroup } from '@/shared/ui';

import type { OnboardingFormValues } from '../../model/onboardingSchema';

export function ProfileStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  return (
    <div className="flex flex-col gap-6">
      <Input
        label="닉네임"
        required
        maxLength={30}
        placeholder="커뮤니티에서 보여질 이름"
        error={errors.nickname?.message}
        {...register('nickname')}
      />

      <RadioGroup legend="성별" required inline error={errors.gender ? '성별을 선택해주세요.' : undefined}>
        <Radio value="MALE" label={GENDER.MALE} {...register('gender')} />
        <Radio value="FEMALE" label={GENDER.FEMALE} {...register('gender')} />
      </RadioGroup>

      <Input
        label="나이"
        type="number"
        inputMode="numeric"
        min={1}
        max={120}
        placeholder="선택 입력"
        error={errors.age?.message}
        {...register('age')}
      />
    </div>
  );
}
