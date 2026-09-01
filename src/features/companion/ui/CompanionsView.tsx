'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UserPlus } from 'lucide-react';

import { useCountryOptions } from '@/features/country/api';
import type { CompanionStatus } from '@/shared/api/types';
import { COMPANION_STATUS } from '@/shared/lib/constants';

import {
  Button,
  buttonClass,
  DatePicker,
  EmptyState,
  ErrorState,
  InfiniteScrollSentinel,
  Select,
  Skeleton,
  VerifiedGate,
} from '@/shared/ui';

import { useCompanionList, type CompanionFilters } from '../api';
import { CompanionCard } from './CompanionCard';

function isStatus(value: string | null): value is CompanionStatus {
  return value === 'RECRUITING' || value === 'COMPLETED';
}

const DATE_FILTERS = [
  { key: 'startDateFrom', label: '출발일 이후' },
  { key: 'startDateTo', label: '출발일 이전' },
  { key: 'endDateFrom', label: '종료일 이후' },
  { key: 'endDateTo', label: '종료일 이전' },
] as const;

export function CompanionsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const countries = useCountryOptions();

  const statusParam = searchParams.get('status');
  const status = isStatus(statusParam) ? statusParam : undefined;
  const country = searchParams.get('country') ?? '';
  const region = searchParams.get('region') ?? '';

  const [regionInput, setRegionInput] = useState(region);

  const filters: CompanionFilters = {
    ...(status ? { status } : {}),
    ...(country ? { country } : {}),
    ...(region ? { region } : {}),
    ...Object.fromEntries(
      DATE_FILTERS.map((filter) => [filter.key, searchParams.get(filter.key) ?? undefined]).filter(
        ([, value]) => value !== undefined && value !== '',
      ),
    ),
  };

  const list = useCompanionList(filters);
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
    setRegionInput('');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-ink-900">동행 구하기</h1>
          <p className="mt-1 text-body text-ink-500">
            일정이 맞는 사람과 함께 다녀보세요. 참여 연락은 카카오톡 오픈채팅으로 이어집니다.
          </p>
        </div>

        <VerifiedGate>
          <Link href="/companions/write" className={buttonClass({ className: 'gap-1.5' })}>
            <UserPlus aria-hidden className="size-4" />
            동행 등록
          </Link>
        </VerifiedGate>
      </header>

      <section
        aria-label="검색 필터"
        className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-surface p-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            aria-label="모집 상태"
            placeholder="전체 상태"
            options={(['RECRUITING', 'COMPLETED'] as const).map((value) => ({
              value,
              label: COMPANION_STATUS[value],
            }))}
            value={status ?? ''}
            onChange={(event) => updateQuery({ status: event.target.value })}
          />

          <Select
            aria-label="국가"
            placeholder="전체 국가"
            disabled={countries.isPending}
            options={countries.options}
            value={country}
            onChange={(event) => updateQuery({ country: event.target.value })}
          />

          <input
            type="text"
            aria-label="지역"
            placeholder="지역 (예: 파리)"
            value={regionInput}
            onChange={(event) => setRegionInput(event.target.value)}
            onBlur={() => updateQuery({ region: regionInput })}
            className="h-10 w-full rounded-md border border-ink-300 bg-surface px-3 text-body placeholder:text-ink-300 hover:border-ink-500 focus:border-brand-500"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {DATE_FILTERS.map((filter) => (
            <DatePicker
              key={filter.key}
              label={filter.label}
              value={searchParams.get(filter.key) ?? ''}
              onChange={(event) => updateQuery({ [filter.key]: event.target.value })}
            />
          ))}
        </div>

        {filterCount > 0 && (
          <Button variant="ghost" className="self-start" onClick={resetFilters}>
            필터 초기화
          </Button>
        )}
      </section>

      {list.isPending && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <li key={index}>
              <Skeleton className="h-52 w-full" />
            </li>
          ))}
        </ul>
      )}

      {list.isError && <ErrorState error={list.error} onRetry={list.refetch} />}

      {list.isEmpty && (
        <EmptyState
          title={filterCount > 0 ? '조건에 맞는 동행이 없어요' : '아직 모집 중인 동행이 없어요'}
          description={
            filterCount > 0
              ? '기간이나 지역을 넓혀보시겠어요?'
              : '가고 싶은 곳이 있다면 먼저 올려보세요.'
          }
          action={
            filterCount > 0 ? (
              <Button variant="secondary" onClick={resetFilters}>
                필터 초기화
              </Button>
            ) : (
              <Link href="/companions/write" className={buttonClass()}>
                동행 등록
              </Link>
            )
          }
        />
      )}

      {list.items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.items.map((post) => (
            <CompanionCard key={post.id} post={post} />
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
