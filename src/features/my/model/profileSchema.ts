import { z } from 'zod';

import type { CurrentSituation, MemberProfileUpdateRequest } from '@/shared/api/types';

/** 프로필 수정은 모든 항목이 선택이라 비워둔 값은 전송하지 않는다 */
export const profileSchema = z.object({
  nickname: z.string().max(30, '30자 이하로 입력해주세요.'),
  currentSituation: z.string(),
  domesticUniversity: z.string().max(100, '100자 이하로 입력해주세요.'),
  dispatchedUniversity: z.string().max(100, '100자 이하로 입력해주세요.'),
  dispatchedCountry: z.string().max(100, '100자 이하로 입력해주세요.'),
  dispatchedRegion: z.string().max(100, '100자 이하로 입력해주세요.'),
  dispatchYear: z.string(),
  dispatchSemester: z.string().max(30, '30자 이하로 입력해주세요.'),
  applicationDeadline: z.string(),
  departureDate: z.string(),
  dispatchStartDate: z.string(),
  returnDate: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

function trimmed(value: string): string | undefined {
  const text = value.trim();
  return text === '' ? undefined : text;
}

export function toProfileRequest(values: ProfileFormValues): MemberProfileUpdateRequest {
  const situation = trimmed(values.currentSituation) as CurrentSituation | undefined;
  const year = trimmed(values.dispatchYear);

  return {
    ...(situation ? { currentSituation: situation } : {}),
    ...(trimmed(values.nickname) ? { nickname: values.nickname.trim() } : {}),
    ...(trimmed(values.domesticUniversity)
      ? { domesticUniversity: values.domesticUniversity.trim() }
      : {}),
    ...(trimmed(values.dispatchedUniversity)
      ? { dispatchedUniversity: values.dispatchedUniversity.trim() }
      : {}),
    ...(trimmed(values.dispatchedCountry)
      ? { dispatchedCountry: values.dispatchedCountry.trim() }
      : {}),
    ...(trimmed(values.dispatchedRegion)
      ? { dispatchedRegion: values.dispatchedRegion.trim() }
      : {}),
    ...(year ? { dispatchYear: Number(year) } : {}),
    ...(trimmed(values.dispatchSemester) ? { dispatchSemester: values.dispatchSemester.trim() } : {}),
    ...(trimmed(values.applicationDeadline)
      ? { applicationDeadline: values.applicationDeadline }
      : {}),
    ...(trimmed(values.departureDate) ? { departureDate: values.departureDate } : {}),
    ...(trimmed(values.dispatchStartDate) ? { dispatchStartDate: values.dispatchStartDate } : {}),
    ...(trimmed(values.returnDate) ? { returnDate: values.returnDate } : {}),
  };
}
