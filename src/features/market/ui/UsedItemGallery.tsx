'use client';

import { useState } from 'react';
import Image from 'next/image';

import type { TradeCategoryImageDto } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { TRADE_CATEGORY } from '@/shared/lib/constants';
import { Modal } from '@/shared/ui';

export interface UsedItemGalleryProps {
  thumbnailImageUrl: string | null;
  categoryImages: TradeCategoryImageDto[];
  title: string;
}

export function UsedItemGallery({ thumbnailImageUrl, categoryImages, title }: UsedItemGalleryProps) {
  const images = [
    ...(thumbnailImageUrl ? [{ url: thumbnailImageUrl, label: '대표 사진' }] : []),
    ...categoryImages.map((image) => ({
      url: image.imageUrl,
      label: TRADE_CATEGORY[image.category],
    })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-lg bg-ink-100" />;
  }

  const active = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setZoomed(true)}
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-ink-100"
        aria-label={`${title} ${active.label} 크게 보기`}
      >
        <Image
          src={active.url}
          alt={`${title} ${active.label}`}
          fill
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-cover"
          priority
        />
      </button>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={cn(
                  'relative size-16 shrink-0 overflow-hidden rounded-md border-2 bg-ink-100',
                  index === activeIndex ? 'border-brand-500' : 'border-transparent',
                )}
              >
                <Image src={image.url} alt={image.label} fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={zoomed} onClose={() => setZoomed(false)} size="lg" title={active.label}>
        <div className="relative aspect-square w-full">
          <Image
            src={active.url}
            alt={`${title} ${active.label}`}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}
