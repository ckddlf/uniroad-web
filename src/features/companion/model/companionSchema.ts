import { z } from 'zod';

import type { CompanionPostRequest, CompanionStatus } from '@/shared/api/types';
import { openChatLinkSchema, serverDateSchema } from '@/shared/lib/validation';

export const companionSchema = z
  .object({
    title: z.string().min(1, '제목을 입력해주세요.').max(100, '100자 이하로 입력해주세요.'),
    content: z.string().min(1, '내용을 입력해주세요.'),
    startDate: serverDateSchema,
    endDate: serverDateSchema,
    country: z.string().min(1, '국가를 선택해주세요.'),
    region: z.string().min(1, '지역을 입력해주세요.'),
    capacity: z
      .string()
      .min(1, '정원을 입력해주세요.')
      .refine((value) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 1 && parsed <= 20;
      }, '1명에서 20명 사이로 입력해주세요.'),
    currentParticipants: z
      .string()
      .min(1, '현재 인원을 입력해주세요.')
      .refine((value) => Number(value) >= 1, '본인을 포함해 1명 이상이어야 해요.'),
    genderRatio: z.string().max(20, '20자 이하로 입력해주세요.'),
    chatLink: openChatLinkSchema,
    status: z.string(),
  })
  .superRefine((values, context) => {
    if (values.endDate < values.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: '종료일은 시작일 이후여야 해요.',
      });
    }

    if (Number(values.currentParticipants) > Number(values.capacity)) {
      context.addIssue({
        code: 'custom',
        path: ['currentParticipants'],
        message: '정원보다 많을 수는 없어요.',
      });
    }
  });

export type CompanionFormValues = z.infer<typeof companionSchema>;

export const COMPANION_DEFAULTS: CompanionFormValues = {
  title: '',
  content: '',
  startDate: '',
  endDate: '',
  country: '',
  region: '',
  capacity: '4',
  // 작성자 본인을 기본 1명으로 잡는다
  currentParticipants: '1',
  genderRatio: '',
  chatLink: '',
  status: 'RECRUITING',
};

export function toCompanionRequest(values: CompanionFormValues): CompanionPostRequest {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    country: values.country,
    region: values.region.trim(),
    chatLink: values.chatLink.trim(),
    status: values.status as CompanionStatus,
    capacity: Number(values.capacity),
    currentParticipants: Number(values.currentParticipants),
    ...(values.genderRatio.trim() ? { genderRatio: values.genderRatio.trim() } : {}),
  };
}
