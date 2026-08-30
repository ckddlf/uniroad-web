'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';

import type { TradeCategory } from '@/shared/api/types';
import { TRADE_CATEGORY, TRADE_CATEGORY_ORDER } from '@/shared/lib/constants';
import { FileDropzone } from '@/shared/ui';

import { CATEGORY_EMOJI } from './TradeItemsField';

export interface CategoryImagesFieldProps {
  value: Partial<Record<TradeCategory, string>>;
  onSelect: (category: TradeCategory, files: File[]) => void;
  onRemove: (category: TradeCategory) => void;
  disabled?: boolean;
}

/** 카테고리마다 대표 사진 한 장씩 */
export function CategoryImagesField({
  value,
  onSelect,
  onRemove,
  disabled,
}: CategoryImagesFieldProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {TRADE_CATEGORY_ORDER.map((category) => {
        const imageUrl = value[category];

        return (
          <div key={category} className="flex flex-col gap-2">
            <p className="text-label font-medium text-ink-700">
              {CATEGORY_EMOJI[category]} {TRADE_CATEGORY[category]}
            </p>

            {imageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-md border border-ink-100">
                <Image
                  src={imageUrl}
                  alt={`${TRADE_CATEGORY[category]} 사진`}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label={`${TRADE_CATEGORY[category]} 사진 삭제`}
                  onClick={() => onRemove(category)}
                  className="absolute top-2 right-2 rounded-md bg-ink-900/60 p-1.5 text-white"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </div>
            ) : (
              <FileDropzone
                accept=".jpg,.jpeg,.png,.webp"
                disabled={disabled}
                description={<span className="text-caption text-ink-500">사진 한 장</span>}
                onSelect={(files) => onSelect(category, files)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
