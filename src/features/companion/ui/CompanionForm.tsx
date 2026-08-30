'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCountries } from '@/features/country/api';
import { toErrorMessage } from '@/shared/api/errors';
import type { CompanionPostResponse } from '@/shared/api/types';
import { COMPANION_STATUS } from '@/shared/lib/constants';
import { applyServerFieldErrors } from '@/shared/lib/form';
import { Button, DateRangePicker, Input, Select, Textarea, useToast } from '@/shared/ui';

import { useCreateCompanion, useUpdateCompanion } from '../api';
import {
  COMPANION_DEFAULTS,
  companionSchema,
  toCompanionRequest,
  type CompanionFormValues,
} from '../model/companionSchema';

export interface CompanionFormProps {
  postId?: number;
  initial?: CompanionPostResponse;
}

function toDefaults(initial?: CompanionPostResponse): CompanionFormValues {
  if (!initial) return COMPANION_DEFAULTS;

  return {
    title: initial.title,
    content: initial.content,
    startDate: initial.startDate,
    endDate: initial.endDate,
    country: initial.country,
    region: initial.region,
    capacity: String(initial.capacity ?? 1),
    currentParticipants: String(initial.currentParticipants ?? 1),
    genderRatio: initial.genderRatio ?? '',
    chatLink: initial.chatLink,
    status: initial.status,
  };
}

export function CompanionForm({ postId, initial }: CompanionFormProps) {
  const router = useRouter();
  const toast = useToast();
  const countries = useCountries();
  const isEdit = postId !== undefined;

  const createCompanion = useCreateCompanion();
  const updateCompanion = useUpdateCompanion(postId ?? 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompanionFormValues>({
    resolver: zodResolver(companionSchema),
    defaultValues: toDefaults(initial),
    mode: 'onBlur',
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const submit = handleSubmit(async (values) => {
    const body = toCompanionRequest(values);

    try {
      if (isEdit) {
        await updateCompanion.mutateAsync(body);
        toast.success('수정했어요.');
        router.replace(`/companions/${postId}`);
        return;
      }

      const newId = await createCompanion.mutateAsync(body);
      toast.success('동행 모집글을 올렸어요.');
      router.replace(`/companions/${newId}`);
    } catch (error) {
      if (
        applyServerFieldErrors(error, setError, [
          'title',
          'content',
          'startDate',
          'endDate',
          'country',
          'region',
          'capacity',
          'currentParticipants',
          'chatLink',
        ])
      ) {
        return;
      }
      toast.error(toErrorMessage(error));
    }
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Input
        label="제목"
        required
        maxLength={100}
        placeholder="예: 파리 에펠탑 야경 보실 분!"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="내용"
        required
        rows={8}
        placeholder="어디를 어떻게 다닐 계획인지, 어떤 분과 함께하고 싶은지 적어주세요."
        error={errors.content?.message}
        {...register('content')}
      />

      <DateRangePicker
        label="여행 기간"
        required
        value={{ start: startDate, end: endDate }}
        error={errors.startDate?.message ?? errors.endDate?.message}
        onChange={(value) => {
          setValue('startDate', value.start, { shouldValidate: true });
          setValue('endDate', value.end, { shouldValidate: true });
        }}
        startLabel="출발일"
        endLabel="종료일"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="국가"
          required
          placeholder={countries.isPending ? '불러오는 중…' : '선택해주세요'}
          disabled={countries.isPending || countries.isError}
          options={(countries.data ?? []).map((country) => ({
            value: country.name,
            label: country.name,
          }))}
          error={errors.country?.message}
          {...register('country')}
        />

        <Input
          label="지역"
          required
          placeholder="예: 파리"
          error={errors.region?.message}
          {...register('region')}
        />

        <Input
          label="정원"
          required
          type="number"
          min={1}
          max={20}
          hint="본인을 포함한 전체 인원"
          error={errors.capacity?.message}
          {...register('capacity')}
        />

        <Input
          label="현재 인원"
          required
          type="number"
          min={1}
          hint="본인만 있다면 1명"
          error={errors.currentParticipants?.message}
          {...register('currentParticipants')}
        />
      </div>

      <Input
        label="성비"
        placeholder="예: 1:1"
        hint="선택 입력이에요."
        error={errors.genderRatio?.message}
        {...register('genderRatio')}
      />

      <Input
        label="오픈채팅 링크"
        required
        type="url"
        placeholder="https://open.kakao.com/..."
        hint="카카오톡 오픈채팅방 링크를 넣어주세요. 참여 희망자가 이 링크로 연락합니다."
        error={errors.chatLink?.message}
        {...register('chatLink')}
      />

      {isEdit && (
        <Select
          label="모집 상태"
          options={(['RECRUITING', 'COMPLETED'] as const).map((value) => ({
            value,
            label: COMPANION_STATUS[value],
          }))}
          error={errors.status?.message}
          {...register('status')}
        />
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? '수정 완료' : '등록하기'}
        </Button>
      </div>
    </form>
  );
}
