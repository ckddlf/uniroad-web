'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PackagePlus, Search } from 'lucide-react';

import { useCountries } from '@/features/country/api';
import type { UsedItemStatus } from '@/shared/api/types';
import { USED_ITEM_STATUS } from '@/shared/lib/constants';
import {
  Button,
  buttonClass,
  EmptyState,
  ErrorState,
  InfiniteScrollSentinel,
  Select,
  Skeleton,
  VerifiedGate,
} from '@/shared/ui';

import { useMarketList, type MarketFilters } from '../api';
import { UsedItemCard } from './UsedItemCard';

type SearchField = 'title' | 'content';

function isStatus(value: string | null): value is UsedItemStatus {
  return value === 'SELLING' || value === 'RESERVED' || value === 'SOLD';
}

export function MarketView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const countries = useCountries();

  const country = searchParams.get('country') ?? '';
  const region = searchParams.get('region') ?? '';
  const statusParam = searchParams.get('status');
  const status = isStatus(statusParam) ? statusParam : undefined;
  const field: SearchField = searchParams.get('field') === 'content' ? 'content' : 'title';
  const keyword = searchParams.get('q') ?? '';

  const [keywordInput, setKeywordInput] = useState(keyword);
  const [regionInput, setRegionInput] = useState(region);

  const filters: MarketFilters = {
    ...(country ? { country } : {}),
    ...(region ? { region } : {}),
    ...(status ? { status } : {}),
    ...(keyword ? { [field]: keyword } : {}),
  };

  const list = useMarketList(filters);

  const updateQuery = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === '') params.delete(key);
      else params.set(key, value);
    }

    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  };

  const resetFilters = () => {
    setKeywordInput('');
    setRegionInput('');
    router.replace(pathname, { scroll: false });
  };

  const filterCount = Object.keys(filters).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-ink-900">중고거래</h1>
          <p className="mt-1 text-body text-ink-500">
            귀국하는 선배의 살림을 통째로 넘겨받아 보세요.
          </p>
        </div>

        <VerifiedGate>
          <Link href="/market/write" className={buttonClass({ className: 'gap-1.5' })}>
            <PackagePlus aria-hidden className="size-4" />
            판매글 등록
          </Link>
        </VerifiedGate>
      </header>

      <section aria-label="검색 필터" className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            aria-label="국가"
            placeholder="전체 국가"
            disabled={countries.isPending || countries.isError}
            options={(countries.data ?? []).map((item) => ({ value: item.name, label: item.name }))}
            value={country}
            onChange={(event) => updateQuery({ country: event.target.value })}
          />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateQuery({ region: regionInput });
            }}
          >
            <input
              type="text"
              aria-label="지역"
              placeholder="지역 (예: 파리)"
              value={regionInput}
              onChange={(event) => setRegionInput(event.target.value)}
              onBlur={() => updateQuery({ region: regionInput })}
              className="h-10 w-full rounded-md border border-ink-300 bg-surface px-3 text-body placeholder:text-ink-300 hover:border-ink-500 focus:border-brand-500"
            />
          </form>

          <Select
            aria-label="판매 상태"
            placeholder="전체 상태"
            options={(['SELLING', 'SOLD'] as const).map((value) => ({
              value,
              label: USED_ITEM_STATUS[value],
            }))}
            value={status ?? ''}
            onChange={(event) => updateQuery({ status: event.target.value })}
          />
        </div>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            updateQuery({ q: keywordInput, field });
          }}
          className="flex flex-wrap gap-2"
        >
          <div className="inline-flex overflow-hidden rounded-md border border-ink-300">
            {(['title', 'content'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={field === value}
                onClick={() => updateQuery({ field: value, q: keywordInput })}
                className={
                  field === value
                    ? 'bg-brand-500 px-3 py-2 text-caption font-medium text-white'
                    : 'bg-surface px-3 py-2 text-caption text-ink-700 hover:bg-ink-100'
                }
              >
                {value === 'title' ? '제목' : '내용'}
              </button>
            ))}
          </div>

          <div className="relative min-w-48 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-500"
            />
            <input
              type="search"
              aria-label="검색어"
              placeholder="무엇을 찾으세요?"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              className="h-10 w-full rounded-md border border-ink-300 bg-surface pr-3 pl-9 text-body placeholder:text-ink-300 hover:border-ink-500 focus:border-brand-500"
            />
          </div>

          <Button type="submit" variant="secondary">
            검색
          </Button>
          {filterCount > 0 && (
            <Button type="button" variant="ghost" onClick={resetFilters}>
              초기화
            </Button>
          )}
        </form>
      </section>

      {list.isPending && (
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <li key={index}>
              <Skeleton className="aspect-square w-full" />
            </li>
          ))}
        </ul>
      )}

      {list.isError && <ErrorState error={list.error} onRetry={list.refetch} />}

      {list.isEmpty && (
        <EmptyState
          title={filterCount > 0 ? '조건에 맞는 물건이 없어요' : '아직 올라온 물건이 없어요'}
          description={
            filterCount > 0
              ? '필터를 바꾸거나 초기화해 보세요.'
              : '귀국하시나요? 쓰던 살림을 정리해 넘겨보세요.'
          }
          action={
            filterCount > 0 ? (
              <Button variant="secondary" onClick={resetFilters}>
                필터 초기화
              </Button>
            ) : undefined
          }
        />
      )}

      {list.items.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {list.items.map((item) => (
            <UsedItemCard key={item.id} item={item} />
          ))}
        </ul>
      )}

      <InfiniteScrollSentinel
        hasNext={list.hasNext}
        loading={list.isFetchingNext}
        onLoadMore={list.fetchNext}
      />
    </div>
  );
}
