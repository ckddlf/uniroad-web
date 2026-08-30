'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, TicketPlus } from 'lucide-react';

import { useCountries } from '@/features/country/api';
import type { TicketStatus } from '@/shared/api/types';
import { TICKET_STATUS } from '@/shared/lib/constants';
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

import { useTicketList, type TicketFilters } from '../api';
import { TicketCard } from './TicketCard';

type SearchField = 'title' | 'content';

function isStatus(value: string | null): value is TicketStatus {
  return value === 'AVAILABLE' || value === 'COMPLETED';
}

export function TicketsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const countries = useCountries();

  const country = searchParams.get('country') ?? '';
  const location = searchParams.get('location') ?? '';
  const statusParam = searchParams.get('status');
  const status = isStatus(statusParam) ? statusParam : undefined;
  const field: SearchField = searchParams.get('field') === 'content' ? 'content' : 'title';
  const keyword = searchParams.get('q') ?? '';

  const [keywordInput, setKeywordInput] = useState(keyword);
  const [locationInput, setLocationInput] = useState(location);

  const filters: TicketFilters = {
    ...(country ? { country } : {}),
    ...(location ? { location } : {}),
    ...(status ? { status } : {}),
    ...(keyword ? { [field]: keyword } : {}),
  };

  const list = useTicketList(filters);
  const filterCount = Object.keys(filters).length;

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
    setLocationInput('');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-ink-900">티켓 양도</h1>
          <p className="mt-1 text-body text-ink-500">
            못 가게 된 기차·항공·공연 티켓을 필요한 사람에게 넘겨주세요.
          </p>
        </div>

        <VerifiedGate>
          <Link href="/tickets/write" className={buttonClass({ className: 'gap-1.5' })}>
            <TicketPlus aria-hidden className="size-4" />
            티켓 등록
          </Link>
        </VerifiedGate>
      </header>

      <section
        aria-label="검색 필터"
        className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-surface p-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            aria-label="국가"
            placeholder="전체 국가"
            disabled={countries.isPending || countries.isError}
            options={(countries.data ?? []).map((item) => ({ value: item.name, label: item.name }))}
            value={country}
            onChange={(event) => updateQuery({ country: event.target.value })}
          />

          <input
            type="text"
            aria-label="장소"
            placeholder="장소·역·공항 (예: CDG)"
            value={locationInput}
            onChange={(event) => setLocationInput(event.target.value)}
            onBlur={() => updateQuery({ location: locationInput })}
            className="h-10 w-full rounded-md border border-ink-300 bg-surface px-3 text-body placeholder:text-ink-300 hover:border-ink-500 focus:border-brand-500"
          />

          <Select
            aria-label="양도 상태"
            placeholder="전체 상태"
            options={(['AVAILABLE', 'COMPLETED'] as const).map((value) => ({
              value,
              label: TICKET_STATUS[value],
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
              placeholder="어떤 티켓을 찾으세요?"
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

        {/* TODO(api): 임박순 정렬·만료 필터가 서버에 없어 정렬 옵션은 제공하지 않는다 */}
        <p className="text-caption text-ink-500">최신 등록순으로 보여드려요.</p>
      </section>

      {list.isPending && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <li key={index}>
              <Skeleton className="h-44 w-full" />
            </li>
          ))}
        </ul>
      )}

      {list.isError && <ErrorState error={list.error} onRetry={list.refetch} />}

      {list.isEmpty && (
        <EmptyState
          title={filterCount > 0 ? '조건에 맞는 티켓이 없어요' : '아직 올라온 티켓이 없어요'}
          description={
            filterCount > 0
              ? '필터를 바꾸거나 초기화해 보세요.'
              : '일정이 바뀌어 못 쓰게 된 티켓이 있다면 올려보세요.'
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.items.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
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
