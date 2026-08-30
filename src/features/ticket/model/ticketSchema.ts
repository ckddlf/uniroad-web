import { z } from 'zod';

import type { TicketTransferRequestDto, TicketType } from '@/shared/api/types';
import { TICKET_TYPE_FIELDS } from '@/entities/ticket/ticketType';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * 서버는 날짜·시간을 전부 문자열로 받으므로 프론트에서 포맷을 강제한다.
 *
 * 타입별 필수 항목은 하나의 평평한 스키마 + superRefine으로 검사한다.
 * discriminatedUnion을 쓰면 폼 값 타입이 유니온이 되어 react-hook-form의
 * register 경로가 타입별로 갈라지기 때문에, 검증 결과는 같으면서 다루기 쉬운 쪽을 택했다.
 */
export const ticketSchema = z
  .object({
    ticketType: z.string().min(1, '티켓 종류를 선택해주세요.'),
    title: z.string().min(1, '제목을 입력해주세요.').max(100, '100자 이하로 입력해주세요.'),
    content: z.string(),
    country: z.string(),
    quantity: z
      .string()
      .min(1, '수량을 입력해주세요.')
      .refine((value) => Number(value) >= 1, '1장 이상 입력해주세요.'),
    transferPrice: z
      .string()
      .min(1, '양도가를 입력해주세요.')
      .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, '숫자로 입력해주세요.'),
    originalPrice: z.string(),

    customTicketType: z.string(),
    useDate: z.string(),
    useTime: z.string(),
    placeName: z.string(),
    performanceDate: z.string(),
    performanceTime: z.string(),
    performancePlace: z.string(),
    departureDate: z.string(),
    departureTime: z.string(),
    departureStation: z.string(),
    arrivalStation: z.string(),
    departureAirport: z.string(),
    arrivalAirport: z.string(),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    accommodationName: z.string(),
  })
  .superRefine((values, context) => {
    const ticketType = values.ticketType as TicketType;
    const fields = TICKET_TYPE_FIELDS[ticketType] as readonly string[] | undefined;
    if (!fields) return;

    for (const field of fields) {
      const value = String(values[field as keyof typeof values] ?? '').trim();

      if (value === '') {
        context.addIssue({ code: 'custom', path: [field], message: '입력해주세요.' });
        continue;
      }

      if (field.endsWith('Date') && !DATE_PATTERN.test(value)) {
        context.addIssue({ code: 'custom', path: [field], message: '날짜를 선택해주세요.' });
      }

      if (field.endsWith('Time') && !TIME_PATTERN.test(value)) {
        context.addIssue({ code: 'custom', path: [field], message: 'HH:mm 형식으로 입력해주세요.' });
      }
    }

    if (values.originalPrice.trim() !== '' && !Number.isFinite(Number(values.originalPrice))) {
      context.addIssue({ code: 'custom', path: ['originalPrice'], message: '숫자로 입력해주세요.' });
    }

    if (ticketType === 'ACCOMMODATION' && values.checkInDate && values.checkOutDate) {
      if (values.checkOutDate < values.checkInDate) {
        context.addIssue({
          code: 'custom',
          path: ['checkOutDate'],
          message: '체크아웃은 체크인 이후여야 해요.',
        });
      }
    }
  });

export type TicketFormValues = z.infer<typeof ticketSchema>;

export const TICKET_DEFAULTS: TicketFormValues = {
  ticketType: '',
  title: '',
  content: '',
  country: '',
  quantity: '1',
  transferPrice: '',
  originalPrice: '',
  customTicketType: '',
  useDate: '',
  useTime: '',
  placeName: '',
  performanceDate: '',
  performanceTime: '',
  performancePlace: '',
  departureDate: '',
  departureTime: '',
  departureStation: '',
  arrivalStation: '',
  departureAirport: '',
  arrivalAirport: '',
  checkInDate: '',
  checkOutDate: '',
  accommodationName: '',
};

function trimmed(value: string): string | undefined {
  const text = value.trim();
  return text === '' ? undefined : text;
}

/** 선택한 타입에 해당하는 필드만 전송한다 (타입을 바꿔가며 입력한 잔여값 방지) */
export function toTicketRequest(values: TicketFormValues): TicketTransferRequestDto {
  const ticketType = values.ticketType as TicketType;
  const fields = TICKET_TYPE_FIELDS[ticketType] as readonly string[];

  const typeFields: Record<string, string | undefined> = {};
  for (const field of fields) {
    typeFields[field] = trimmed(String(values[field as keyof TicketFormValues] ?? ''));
  }

  return {
    ticketType,
    title: values.title.trim(),
    quantity: Math.max(1, Math.round(Number(values.quantity) || 1)),
    transferPrice: Math.round(Number(values.transferPrice)),
    ...(trimmed(values.content) ? { content: values.content.trim() } : {}),
    ...(trimmed(values.country) ? { country: values.country.trim() } : {}),
    ...(trimmed(values.originalPrice)
      ? { originalPrice: Math.round(Number(values.originalPrice)) }
      : {}),
    ...typeFields,
  };
}
