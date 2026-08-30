'use client';

import { useFormContext } from 'react-hook-form';

import type { CurrentSituation } from '@/shared/api/types';
import { DatePicker } from '@/shared/ui';

import type { OnboardingFormValues } from '../../model/onboardingSchema';

/** 2단계에서 고른 상황에 해당하는 날짜만 묻는다 */
export function ScheduleStep({ situation }: { situation: CurrentSituation | '' }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  return (
    <div className="flex flex-col gap-6">
      {situation === 'PREPARING_APPLICATION' && (
        <DatePicker
          label="지원 마감일"
          hint="국제처 공고에 적힌 서류 마감일을 넣어주세요. D-day로 보여드릴게요."
          error={errors.applicationDeadline?.message}
          {...register('applicationDeadline')}
        />
      )}

      {situation === 'PREPARING_DEPARTURE' && (
        <DatePicker
          label="출국일"
          hint="출국까지 남은 날짜를 홈 화면에서 보여드릴게요."
          error={errors.departureDate?.message}
          {...register('departureDate')}
        />
      )}

      {situation === 'DISPATCHED' && (
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      )}

      <p className="text-caption text-ink-500">
        지금 비워두셔도 괜찮아요. 마이페이지에서 언제든 추가할 수 있어요.
      </p>
    </div>
  );
}
