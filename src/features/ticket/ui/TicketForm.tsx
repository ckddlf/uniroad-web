'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCountries } from '@/features/country/api';
import { TICKET_TYPE_EMOJI, TICKET_TYPE_FIELDS } from '@/entities/ticket/ticketType';
import { toErrorMessage } from '@/shared/api/errors';
import type { TicketTransferResponseDto, TicketType } from '@/shared/api/types';
import { TICKET_TYPE, TICKET_TYPE_ORDER } from '@/shared/lib/constants';
import { discountRate, formatNumber } from '@/shared/lib/format';
import { applyServerFieldErrors } from '@/shared/lib/form';
import { Button, Input, Select, SelectableCard, StepProgress, Textarea, useToast } from '@/shared/ui';

import { useCreateTicket, useUpdateTicket } from '../api';
import {
  TICKET_DEFAULTS,
  ticketSchema,
  toTicketRequest,
  type TicketFormValues,
} from '../model/ticketSchema';
import { TicketTypeFields } from './TicketTypeFields';

const STEPS = ['어떤 티켓인가요?', '티켓 정보', '수량과 가격'];

const COMMON_FIELDS = [
  'title',
  'content',
  'country',
  'quantity',
  'transferPrice',
  'originalPrice',
] as const;

export interface TicketFormProps {
  ticketId?: number;
  initial?: TicketTransferResponseDto;
}

function toDefaults(initial?: TicketTransferResponseDto): TicketFormValues {
  if (!initial) return TICKET_DEFAULTS;

  return {
    ...TICKET_DEFAULTS,
    ticketType: initial.ticketType,
    title: initial.title,
    content: initial.content ?? '',
    country: initial.country ?? '',
    quantity: String(initial.quantity ?? 1),
    transferPrice: String(initial.transferPrice ?? ''),
    originalPrice: initial.originalPrice ? String(initial.originalPrice) : '',
    customTicketType: initial.customTicketType ?? '',
    useDate: initial.useDate ?? '',
    useTime: initial.useTime ?? '',
    placeName: initial.placeName ?? '',
    performanceDate: initial.performanceDate ?? '',
    performanceTime: initial.performanceTime ?? '',
    performancePlace: initial.performancePlace ?? '',
    departureDate: initial.departureDate ?? '',
    departureTime: initial.departureTime ?? '',
    departureStation: initial.departureStation ?? '',
    arrivalStation: initial.arrivalStation ?? '',
    departureAirport: initial.departureAirport ?? '',
    arrivalAirport: initial.arrivalAirport ?? '',
    checkInDate: initial.checkInDate ?? '',
    checkOutDate: initial.checkOutDate ?? '',
    accommodationName: initial.accommodationName ?? '',
  };
}

export function TicketForm({ ticketId, initial }: TicketFormProps) {
  const router = useRouter();
  const toast = useToast();
  const countries = useCountries();
  const isEdit = ticketId !== undefined;

  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket(ticketId ?? 0);

  // 수정할 때는 단계를 나누지 않고 한 화면에서 모두 고칠 수 있게 한다
  const [step, setStep] = useState<1 | 2 | 3>(isEdit ? 3 : 1);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: toDefaults(initial),
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const ticketType = watch('ticketType') as TicketType | '';
  const transferPrice = watch('transferPrice');
  const originalPrice = watch('originalPrice');
  const discount = discountRate(Number(originalPrice), Number(transferPrice));

  const goNext = async () => {
    if (step === 1) {
      if (!(await trigger('ticketType'))) return;
      setStep(2);
      return;
    }

    if (step === 2 && ticketType) {
      const fields = TICKET_TYPE_FIELDS[ticketType] as readonly (keyof TicketFormValues)[];
      if (!(await trigger(fields))) return;
      setStep(3);
    }
  };

  const submit = handleSubmit(async (values) => {
    const body = toTicketRequest(values);

    try {
      if (isEdit) {
        await updateTicket.mutateAsync(body);
        toast.success('수정했어요.');
        router.replace(`/tickets/${ticketId}`);
        return;
      }

      const newId = await createTicket.mutateAsync(body);
      toast.success('티켓을 올렸어요.');
      router.replace(`/tickets/${newId}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError, [...COMMON_FIELDS])) return;
      toast.error(toErrorMessage(error));
    }
  });

  const showTypeStep = isEdit || step === 1;
  const showDetailStep = isEdit || step === 2;
  const showPriceStep = isEdit || step === 3;

  return (
    <FormProvider {...form}>
      {!isEdit && <StepProgress current={step} steps={STEPS} />}

      <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
        {showTypeStep && (
          <section className="flex flex-col gap-3">
            <h2 className="text-h2 text-ink-900">어떤 티켓인가요?</h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TICKET_TYPE_ORDER.map((type) => (
                <SelectableCard
                  key={type}
                  value={type}
                  icon={TICKET_TYPE_EMOJI[type]}
                  title={TICKET_TYPE[type]}
                  {...register('ticketType')}
                />
              ))}
            </div>

            {errors.ticketType && (
              <p role="alert" className="text-caption text-danger">
                {errors.ticketType.message}
              </p>
            )}
          </section>
        )}

        {showDetailStep && ticketType && (
          <section className="flex flex-col gap-4">
            <h2 className="text-h2 text-ink-900">티켓 정보</h2>
            <TicketTypeFields ticketType={ticketType} />
          </section>
        )}

        {showPriceStep && (
          <section className="flex flex-col gap-4">
            <h2 className="text-h2 text-ink-900">수량과 가격</h2>

            <Input
              label="제목"
              required
              maxLength={100}
              placeholder="예: 파리 → 니스 TGV 2매 양도합니다"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="수량"
                required
                type="number"
                min={1}
                error={errors.quantity?.message}
                {...register('quantity')}
              />
              <Input
                label="양도가"
                required
                type="number"
                min={0}
                hint="현지 통화 기준"
                error={errors.transferPrice?.message}
                {...register('transferPrice')}
              />
              <Input
                label="정가"
                type="number"
                min={0}
                hint="선택 입력"
                error={errors.originalPrice?.message}
                {...register('originalPrice')}
              />
            </div>

            {discount !== null && (
              <p className="text-body text-brand-700">
                정가 {formatNumber(Number(originalPrice))} 대비 {discount}% 저렴해요.
              </p>
            )}

            <Select
              label="국가"
              placeholder={countries.isPending ? '불러오는 중…' : '선택해주세요'}
              disabled={countries.isPending || countries.isError}
              options={(countries.data ?? []).map((country) => ({
                value: country.name,
                label: country.name,
              }))}
              error={errors.country?.message}
              {...register('country')}
            />

            <Textarea
              label="설명"
              rows={6}
              placeholder="양도 사유, 좌석 정보, 전달 방법을 적어주세요."
              error={errors.content?.message}
              {...register('content')}
            />
          </section>
        )}

        <div className="flex justify-end gap-2">
          {!isEdit && step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((current) => (current - 1) as 1 | 2 | 3)}
            >
              이전
            </Button>
          )}

          {!isEdit && step < 3 ? (
            <Button type="button" onClick={() => void goNext()}>
              다음
            </Button>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEdit ? '수정 완료' : '등록하기'}
              </Button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
