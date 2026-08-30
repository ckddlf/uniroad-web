'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import type { TradeCategory } from '@/shared/api/types';
import { TRADE_CATEGORY, TRADE_CATEGORY_ORDER } from '@/shared/lib/constants';
import { Button, Input } from '@/shared/ui';

import type { UsedItemFormValues } from '../model/usedItemSchema';

export const CATEGORY_EMOJI: Record<TradeCategory, string> = {
  KITCHEN: '🍳',
  BATH: '🛁',
  LIFE: '🧺',
  BEDDING: '🛏',
  ELECTRONICS: '🔌',
  ETC: '📦',
};

/** 카테고리별로 품목을 나눠 입력받는다. 품목이 0개여도 등록할 수 있다. */
export function TradeItemsField() {
  const { control, register } = useFormContext<UsedItemFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption text-ink-500">
        품목을 적어두면 훨씬 빨리 연락이 와요. 비워두고 등록해도 괜찮아요.
      </p>

      {TRADE_CATEGORY_ORDER.map((category) => {
        const rows = fields
          .map((field, index) => ({ field, index }))
          .filter(({ field }) => field.category === category);

        return (
          <fieldset key={category} className="rounded-md border border-ink-100 p-4">
            <legend className="px-1 text-label font-medium text-ink-700">
              {CATEGORY_EMOJI[category]} {TRADE_CATEGORY[category]}
            </legend>

            <div className="flex flex-col gap-2">
              {rows.map(({ field, index }) => (
                <div key={field.id} className="flex items-end gap-2">
                  <Input
                    aria-label={`${TRADE_CATEGORY[category]} 품목 이름`}
                    placeholder="예: 냄비"
                    containerClassName="flex-1"
                    {...register(`items.${index}.name`)}
                  />
                  <Input
                    aria-label="수량"
                    type="number"
                    min={1}
                    containerClassName="w-24"
                    {...register(`items.${index}.quantity`)}
                  />
                  <button
                    type="button"
                    aria-label="품목 삭제"
                    onClick={() => remove(index)}
                    className="mb-0.5 rounded-md p-2.5 text-ink-500 transition-colors hover:bg-ink-100"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                leftIcon={<Plus aria-hidden className="size-4" />}
                onClick={() => append({ category, name: '', quantity: '1' })}
              >
                품목 추가
              </Button>
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
