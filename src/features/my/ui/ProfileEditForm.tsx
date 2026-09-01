'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCountryOptions } from '@/features/country/api';
import { useUpdateProfile } from '@/features/member/api';
import { toErrorMessage } from '@/shared/api/errors';
import type { CurrentSituation, MemberProfileUpdateRequest } from '@/shared/api/types';
import {
  CURRENT_SITUATION,
  CURRENT_SITUATION_DESCRIPTION,
  DISPATCH_SEMESTERS,
} from '@/shared/lib/constants';
import { applyServerFieldErrors } from '@/shared/lib/form';
import { useAuthStore } from '@/shared/store/authStore';
import {
  Button,
  DatePicker,
  Input,
  Select,
  SelectableCard,
  SelectOrCustom,
  Skeleton,
  useToast,
} from '@/shared/ui';

import { profileSchema, toProfileRequest, type ProfileFormValues } from '../model/profileSchema';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, index) => {
  const year = CURRENT_YEAR + index;
  return { value: String(year), label: `${year}년` };
});

const SITUATIONS: CurrentSituation[] = [
  'PREPARING_APPLICATION',
  'PREPARING_DEPARTURE',
  'DISPATCHED',
];

export function ProfileEditForm() {
  const toast = useToast();
  const member = useAuthStore((state) => state.member);
  const countries = useCountryOptions();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: '',
      currentSituation: '',
      domesticUniversity: '',
      dispatchedUniversity: '',
      dispatchedCountry: '',
      dispatchedRegion: '',
      dispatchYear: '',
      dispatchSemester: '',
      applicationDeadline: '',
      departureDate: '',
      dispatchStartDate: '',
      returnDate: '',
    },
  });

  useEffect(() => {
    if (!member) return;

    reset({
      nickname: member.nickname ?? '',
      currentSituation: member.currentSituation ?? '',
      domesticUniversity: member.domesticUniversity ?? '',
      dispatchedUniversity: member.dispatchedUniversity ?? '',
      dispatchedCountry: member.dispatchedCountry ?? '',
      dispatchedRegion: member.dispatchedRegion ?? '',
      dispatchYear: member.dispatchYear ? String(member.dispatchYear) : '',
      dispatchSemester: member.dispatchSemester ?? '',
      applicationDeadline: member.applicationDeadline ?? '',
      departureDate: member.departureDate ?? '',
      dispatchStartDate: member.dispatchStartDate ?? '',
      returnDate: member.returnDate ?? '',
    });
  }, [member, reset]);

  const situation = watch('currentSituation') as CurrentSituation | '';

  const submit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(toProfileRequest(values));
      toast.success('프로필을 수정했어요.');
    } catch (error) {
      const fields: (keyof MemberProfileUpdateRequest)[] = [
        'nickname',
        'domesticUniversity',
        'dispatchedUniversity',
        'dispatchedCountry',
        'dispatchedRegion',
        'dispatchSemester',
      ];
      if (applyServerFieldErrors(error, setError, fields as never[])) return;
      toast.error(toErrorMessage(error));
    }
  });

  if (!member) return <Skeleton className="h-96 w-full" />;

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <Input
        label="닉네임"
        maxLength={30}
        error={errors.nickname?.message}
        {...register('nickname')}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-label font-medium text-ink-700">현재 단계</legend>

        <div className="grid gap-3 sm:grid-cols-3">
          {SITUATIONS.map((value) => (
            <SelectableCard
              key={value}
              value={value}
              title={CURRENT_SITUATION[value]}
              description={CURRENT_SITUATION_DESCRIPTION[value]}
              {...register('currentSituation')}
            />
          ))}
        </div>
      </fieldset>

      <Input
        label="재학 중인 학교"
        maxLength={100}
        error={errors.domesticUniversity?.message}
        {...register('domesticUniversity')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectOrCustom
          label="파견 국가"
          placeholder={countries.isPending ? '불러오는 중…' : '선택해주세요'}
          options={countries.options}
          customPlaceholder="예: 프랑스"
          hint={countries.fallbackHint}
          error={errors.dispatchedCountry?.message}
          value={watch('dispatchedCountry')}
          onChange={(value) =>
            setValue('dispatchedCountry', value, { shouldDirty: true, shouldValidate: true })
          }
        />

        <Input
          label="파견 대학"
          maxLength={100}
          error={errors.dispatchedUniversity?.message}
          {...register('dispatchedUniversity')}
        />

        <Input
          label="파견 지역"
          maxLength={100}
          error={errors.dispatchedRegion?.message}
          {...register('dispatchedRegion')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="파견 연도"
            placeholder="선택"
            options={YEAR_OPTIONS}
            error={errors.dispatchYear?.message}
            {...register('dispatchYear')}
          />
          <Select
            label="파견 학기"
            placeholder="선택"
            options={DISPATCH_SEMESTERS.map((semester) => ({ value: semester, label: semester }))}
            error={errors.dispatchSemester?.message}
            {...register('dispatchSemester')}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {situation === 'PREPARING_APPLICATION' && (
          <DatePicker
            label="지원 마감일"
            error={errors.applicationDeadline?.message}
            {...register('applicationDeadline')}
          />
        )}
        {situation === 'PREPARING_DEPARTURE' && (
          <DatePicker
            label="출국일"
            error={errors.departureDate?.message}
            {...register('departureDate')}
          />
        )}
        {situation === 'DISPATCHED' && (
          <>
            <DatePicker
              label="파견 시작일"
              error={errors.dispatchStartDate?.message}
              {...register('dispatchStartDate')}
            />
            <DatePicker
              label="귀국 예정일"
              error={errors.returnDate?.message}
              {...register('returnDate')}
            />
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          저장하기
        </Button>
      </div>
    </form>
  );
}
