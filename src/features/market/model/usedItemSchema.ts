import { z } from 'zod';

import type { TradeCategory, TradeItemDto, UsedItemRequestDto } from '@/shared/api/types';

/** 숫자 입력도 폼에서는 문자열로 다루고 전송 직전에 변환한다 */
export const usedItemSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '100자 이하로 입력해주세요.'),
  content: z.string().min(1, '설명을 입력해주세요.'),
  price: z
    .string()
    .min(1, '가격을 입력해주세요.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, '숫자로 입력해주세요.'),
  country: z.string().min(1, '국가를 선택해주세요.'),
  region: z.string().min(1, '지역을 입력해주세요.'),
  semester: z.string().min(1, '거래 학기를 선택해주세요.'),
  items: z.array(
    z.object({
      category: z.string(),
      name: z.string(),
      quantity: z.string(),
    }),
  ),
});

export type UsedItemFormValues = z.infer<typeof usedItemSchema>;

export const USED_ITEM_DEFAULTS: UsedItemFormValues = {
  title: '',
  content: '',
  price: '',
  country: '',
  region: '',
  semester: '',
  items: [],
};

/** 이름이 비어 있는 줄은 사용자가 추가만 하고 안 채운 것이라 보내지 않는다 */
function toItems(values: UsedItemFormValues['items']): TradeItemDto[] {
  return values
    .filter((item) => item.name.trim() !== '')
    .map((item) => ({
      category: item.category as TradeCategory,
      name: item.name.trim(),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
    }));
}

export function toUsedItemRequest(
  values: UsedItemFormValues,
  thumbnailImageUrl: string,
  categoryImages: Partial<Record<TradeCategory, string>>,
): UsedItemRequestDto {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
    price: Math.round(Number(values.price)),
    country: values.country,
    region: values.region.trim(),
    semester: values.semester,
    thumbnailImageUrl,
    items: toItems(values.items),
    categoryImages: Object.entries(categoryImages)
      .filter((entry): entry is [TradeCategory, string] => Boolean(entry[1]))
      .map(([category, imageUrl]) => ({ category, imageUrl })),
  };
}
