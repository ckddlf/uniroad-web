'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { DISPATCH_SEMESTERS } from '@/shared/lib/constants';
import { useCountries } from '@/features/country/api';
import { Checkbox, Input, Select } from '@/shared/ui';

import type { OnboardingFormValues } from '../../model/onboardingSchema';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, index) => {
  const year = CURRENT_YEAR + index;
  return { value: String(year), label: `${year}년` };
});

export function SchoolStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  const countries = useCountries();
  const undecided = watch('dispatchUndecided');

  // 파견교 미정으로 바꾸면 이미 입력한 파견 정보를 비운다
  useEffect(() => {
    if (!undecided) return;

    setValue('dispatchedCountry', '');
    setValue('dispatchedUniversity', '');
    setValue('dispatchedRegion', '');
    setValue('dispatchYear', '');
    setValue('dispatchSemester', '');
  }, [undecided, setValue]);

  return (
    <div className="flex flex-col gap-6">
      <Input
        label="재학 중인 학교"
        required
        placeholder="예: 한국대학교"
        error={errors.domesticUniversity?.message}
        {...register('domesticUniversity')}
      />

      <Checkbox
        label="아직 파견교가 정해지지 않았어요"
        description="나중에 마이페이지에서 입력할 수 있어요."
        {...register('dispatchUndecided')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {countries.isError ? (
          // 국가 목록을 못 불러와도 진행은 막지 않는다 (서버는 자유 문자열을 받는다)
          <Input
            label="파견 국가"
            placeholder="예: 프랑스"
            disabled={undecided}
            hint="국가 목록을 불러오지 못해 직접 입력으로 전환했어요."
            error={errors.dispatchedCountry?.message}
            {...register('dispatchedCountry')}
          />
        ) : (
          <Select
            label="파견 국가"
            placeholder={countries.isPending ? '불러오는 중…' : '선택해주세요'}
            disabled={undecided || countries.isPending}
            options={(countries.data ?? []).map((country) => ({
              value: country.name,
              label: country.name,
            }))}
            error={errors.dispatchedCountry?.message}
            {...register('dispatchedCountry')}
          />
        )}

        <Input
          label="파견 대학"
          placeholder="예: 소르본 대학교"
          disabled={undecided}
          error={errors.dispatchedUniversity?.message}
          {...register('dispatchedUniversity')}
        />

        <Input
          label="파견 지역"
          placeholder="예: 파리"
          disabled={undecided}
          error={errors.dispatchedRegion?.message}
          {...register('dispatchedRegion')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="파견 연도"
            placeholder="선택"
            disabled={undecided}
            options={YEAR_OPTIONS}
            error={errors.dispatchYear?.message}
            {...register('dispatchYear')}
          />
          <Select
            label="파견 학기"
            placeholder="선택"
            disabled={undecided}
            options={DISPATCH_SEMESTERS.map((semester) => ({ value: semester, label: semester }))}
            error={errors.dispatchSemester?.message}
            {...register('dispatchSemester')}
          />
        </div>
      </div>
    </div>
  );
}
