'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ImageOff, ShoppingBag } from 'lucide-react';

import { useMarketList } from '@/features/market/api';
import { formatNumber } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';

import { WidgetCard } from './WidgetCard';

export function MarketWidget() {
  const list = useMarketList({});
  const items = list.items.slice(0, 4);

  return (
    <WidgetCard
      title="최근 중고거래"
      icon={<ShoppingBag aria-hidden className="size-5 text-ink-500" />}
      href="/market"
    >
      {list.isPending && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      )}

      {list.isError && <p className="text-body text-ink-500">거래글을 불러오지 못했어요.</p>}

      {!list.isPending && !list.isError && items.length === 0 && (
        <p className="text-body text-ink-500">아직 올라온 물건이 없어요.</p>
      )}

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/market/${item.id}`} className="flex flex-col gap-1.5">
                <span className="relative block aspect-square overflow-hidden rounded-md bg-ink-100">
                  {item.thumbnailImageUrl ? (
                    <Image
                      src={item.thumbnailImageUrl}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-ink-300">
                      <ImageOff aria-hidden className="size-5" />
                    </span>
                  )}
                </span>

                <span className="truncate text-caption text-ink-700">{item.title}</span>
                <span className="text-caption font-medium text-ink-900">
                  {formatNumber(item.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
