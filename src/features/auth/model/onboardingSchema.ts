import { z } from 'zod';

import type { CurrentSituation, Gender, OnboardingRequest } from '@/shared/api/types';
import { nicknameSchema } from '@/shared/lib/validation';

/**
 * 온보딩은 4단계로 나눠 입력받고 마지막에 한 번에 전송한다.
 * 숫자·날짜도 폼에서는 문자열로 다루고 전송 직전에 변환한다.
 */
export const onboardingSchema = z.object({
  // 1단계
  nickname: nicknameSchema,
  gender: z
    .string()
    .refine((value): value is Gender => value === 'MALE' || value === 'FEMALE', '성별을 선택해주세요.'),
  birthYear: z.string(),

  // 2단계
  currentSituation: z
    .string()
    .refine(
      (value): value is CurrentSituation =>
        value === 'PREPARING_APPLICATION' ||
        value === 'PREPARING_DEPARTURE' ||
        value === 'DISPATCHED',
      '지금 어떤 단계인지 선택해주세요.',
    ),

  // 3단계
  domesticUniversity: z
    .string()
    .min(1, '재학 중인 학교를 입력해주세요.')
    .max(100, '100자 이하로 입력해주세요.'),
  /** 파견교 미정 — 체크하면 파견 관련 입력을 비활성화한다 */
  dispatchUndecided: z.boolean(),
  dispatchedCountry: z.string(),
  dispatchedUniversity: z.string().max(100, '100자 이하로 입력해주세요.'),
  dispatchedRegion: z.string().max(100, '100자 이하로 입력해주세요.'),
  dispatchYear: z.string(),
  dispatchSemester: z.string(),

  // 4단계 — currentSituation에 따라 하나만 노출된다
  applicationDeadline: z.string(),
  departureDate: z.string(),
  dispatchStartDate: z.string(),
  returnDate: z.string(),
});

export type OnboardingFormValues = z.input<typeof onboardingSchema>;

export const ONBOARDING_DEFAULTS: OnboardingFormValues = {
  nickname: '',
  gender: '',
  birthYear: '',
  currentSituation: '',
  domesticUniversity: '',
  dispatchUndecided: false,
  dispatchedCountry: '',
  dispatchedUniversity: '',
  dispatchedRegion: '',
  dispatchYear: '',
  dispatchSemester: '',
  applicationDeadline: '',
  departureDate: '',
  dispatchStartDate: '',
  returnDate: '',
};

/** 단계별로 검증할 필드 */
export const ONBOARDING_STEP_FIELDS = {
  1: ['nickname', 'gender', 'birthYear'],
  2: ['currentSituation'],
  3: [
    'domesticUniversity',
    'dispatchedUniversity',
    'dispatchedRegion',
    'dispatchedCountry',
    'dispatchYear',
    'dispatchSemester',
  ],
  4: ['applicationDeadline', 'departureDate', 'dispatchStartDate', 'returnDate'],
} as const satisfies Record<1 | 2 | 3 | 4, readonly (keyof OnboardingFormValues)[]>;

function trimmed(value: string): string | undefined {
  const text = value.trim();
  return text === '' ? undefined : text;
}

function toNumber(value: string): number | undefined {
  const text = value.trim();
  if (text === '') return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** 상황에 맞지 않는 날짜는 보내지 않는다 (지원 준비중인데 귀국일을 넣는 식의 값 방지) */
export function toOnboardingRequest(values: OnboardingFormValues): OnboardingRequest {
  const situation = values.currentSituation as CurrentSituation;
  const undecided = values.dispatchUndecided;

  return {
    nickname: values.nickname.trim(),
    gender: values.gender as Gender,
    currentSituation: situation,
    domesticUniversity: values.domesticUniversity.trim(),
    birthYear: toNumber(values.birthYear),
    dispatchedUniversity: undecided ? undefined : trimmed(values.dispatchedUniversity),
    dispatchedCountry: undecided ? undefined : trimmed(values.dispatchedCountry),
    dispatchedRegion: undecided ? undefined : trimmed(values.dispatchedRegion),
    dispatchYear: undecided ? undefined : toNumber(values.dispatchYear),
    dispatchSemester: undecided ? undefined : trimmed(values.dispatchSemester),
    applicationDeadline:
      situation === 'PREPARING_APPLICATION' ? trimmed(values.applicationDeadline) : undefined,
    departureDate: situation === 'PREPARING_DEPARTURE' ? trimmed(values.departureDate) : undefined,
    dispatchStartDate: situation === 'DISPATCHED' ? trimmed(values.dispatchStartDate) : undefined,
    returnDate: situation === 'DISPATCHED' ? trimmed(values.returnDate) : undefined,
  };
}
