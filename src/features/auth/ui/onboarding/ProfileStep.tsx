'use client';

import { useFormContext } from 'react-hook-form';

import { Input } from '@/shared/ui';

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
    </div>
  );
}
