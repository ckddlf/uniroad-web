'use client';

import { useFormContext } from 'react-hook-form';

import type { TicketType } from '@/shared/api/types';
import { DatePicker, Input } from '@/shared/ui';

import type { TicketFormValues } from '../model/ticketSchema';

/** 타입별 전용 필드. 날짜는 date 입력, 시간은 time 입력이라 포맷이 자동으로 맞는다. */
export function TicketTypeFields({ ticketType }: { ticketType: TicketType }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TicketFormValues>();

  if (ticketType === 'TOUR') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker label="이용일" required error={errors.useDate?.message} {...register('useDate')} />
        <Input label="이용 시간" type="time" required error={errors.useTime?.message} {...register('useTime')} />
        <Input
          label="장소"
          required
          placeholder="예: 루브르 박물관"
          containerClassName="sm:col-span-2"
          error={errors.placeName?.message}
          {...register('placeName')}
        />
      </div>
    );
  }

  if (ticketType === 'CONCERT') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="공연일"
          required
          error={errors.performanceDate?.message}
          {...register('performanceDate')}
        />
        <Input
          label="공연 시간"
          type="time"
          required
          error={errors.performanceTime?.message}
          {...register('performanceTime')}
        />
        <Input
          label="공연장"
          required
          placeholder="예: 올랭피아"
          containerClassName="sm:col-span-2"
          error={errors.performancePlace?.message}
          {...register('performancePlace')}
        />
      </div>
    );
  }

  if (ticketType === 'TRAIN') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="출발일"
          required
          error={errors.departureDate?.message}
          {...register('departureDate')}
        />
        <Input
          label="출발 시간"
          type="time"
          required
          error={errors.departureTime?.message}
          {...register('departureTime')}
        />
        <Input
          label="출발역"
          required
          placeholder="예: Paris Gare de Lyon"
          error={errors.departureStation?.message}
          {...register('departureStation')}
        />
        <Input
          label="도착역"
          required
          placeholder="예: Nice Ville"
          error={errors.arrivalStation?.message}
          {...register('arrivalStation')}
        />
      </div>
    );
  }

  if (ticketType === 'FLIGHT') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="출발일"
          required
          error={errors.departureDate?.message}
          {...register('departureDate')}
        />
        <Input
          label="출발 시간"
          type="time"
          required
          error={errors.departureTime?.message}
          {...register('departureTime')}
        />
        <Input
          label="출발 공항"
          required
          placeholder="예: CDG"
          error={errors.departureAirport?.message}
          {...register('departureAirport')}
        />
        <Input
          label="도착 공항"
          required
          placeholder="예: ICN"
          error={errors.arrivalAirport?.message}
          {...register('arrivalAirport')}
        />
      </div>
    );
  }

  if (ticketType === 'ACCOMMODATION') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          label="체크인"
          required
          error={errors.checkInDate?.message}
          {...register('checkInDate')}
        />
        <DatePicker
          label="체크아웃"
          required
          error={errors.checkOutDate?.message}
          {...register('checkOutDate')}
        />
        <Input
          label="숙소 이름"
          required
          placeholder="예: Hotel du Nord"
          containerClassName="sm:col-span-2"
          error={errors.accommodationName?.message}
          {...register('accommodationName')}
        />
      </div>
    );
  }

  return (
    <Input
      label="티켓 종류"
      required
      placeholder="어떤 티켓인지 직접 적어주세요"
      error={errors.customTicketType?.message}
      {...register('customTicketType')}
    />
  );
}
