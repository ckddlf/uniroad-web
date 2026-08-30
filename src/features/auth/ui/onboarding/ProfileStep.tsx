'use client';

import { useFormContext } from 'react-hook-form';

import { BIRTH_YEAR_OPTIONS, GENDER } from '@/shared/lib/constants';
import { Input, Radio, RadioGroup, SelectOrCustom } from '@/shared/ui';

import type { OnboardingFormValues } from '../../model/onboardingSchema';

const CURRENT_YEAR = new Date().getFullYear();

export function ProfileStep() {
  const {
    register,
    watch,
    setValue,
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

      <SelectOrCustom
        label="출생 연도"
        placeholder="선택 입력"
        options={BIRTH_YEAR_OPTIONS.map((year) => ({ value: year, label: `${year}년` }))}
        customPlaceholder="예: 2003"
        inputType="number"
        inputMode="numeric"
        min={1900}
        max={CURRENT_YEAR}
        error={errors.birthYear?.message}
        value={watch('birthYear')}
        onChange={(value) =>
          setValue('birthYear', value, { shouldDirty: true, shouldValidate: true })
        }
      />
    </div>
  );
}
