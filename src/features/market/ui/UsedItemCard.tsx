import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, ImageOff } from 'lucide-react';

import { AuthorChip } from '@/entities/trade/AuthorChip';
import type { UsedItemSummaryResponseDto } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { USED_ITEM_STATUS } from '@/shared/lib/constants';
import { formatNumber } from '@/shared/lib/format';

export function UsedItemCard({ item }: { item: UsedItemSummaryResponseDto }) {
  const place = [item.country, item.region].filter(Boolean).join(' ');
  const sold = item.status === 'SOLD';

  return (
    <li>
      <Link
        href={`/market/${item.id}`}
        className={cn(
          'flex h-full flex-col gap-2 rounded-lg border border-ink-100 bg-surface p-3 transition-colors hover:border-ink-300',
          sold && 'opacity-70',
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-ink-100">
          {item.thumbnailImageUrl ? (
            <Image
              src={item.thumbnailImageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-ink-300">
              <ImageOff aria-hidden className="size-6" />
            </span>
          )}
          {sold && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink-900/50">
              <span className="rounded-full bg-ink-900/80 px-3 py-1 text-caption font-medium text-white">
                {USED_ITEM_STATUS.SOLD}
              </span>
            </span>
          )}
        </div>

        <p className="text-body font-medium text-ink-900">{formatNumber(item.price)}</p>
        <h3 className="line-clamp-2-safe text-body text-ink-700">{item.title}</h3>

        <p className="text-caption text-ink-500">
          {place}
          {item.semester && ` · ${item.semester}`}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <AuthorChip author={item} className="min-w-0 flex-1" />
          <span className="inline-flex shrink-0 items-center gap-1 text-caption text-ink-500">
            <Bookmark aria-hidden className="size-3.5" />
            {formatNumber(item.scrapCount)}
          </span>
        </div>
      </Link>
    </li>
  );
}
