'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { currencySymbol } from '@/entities/account/currency';
import { ACCOUNT_CATEGORY } from '@/shared/lib/constants';
import { formatDate, toServerDate } from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/format';
import { useAuthStore } from '@/shared/store/authStore';
import { Button, ErrorState, Skeleton } from '@/shared/ui';

import { useBalance, useDailyTransactions, useMonthlySummary } from '../api';
import { AddTransactionModal, CATEGORY_EMOJI } from './AddTransactionModal';
import { MonthCalendar } from './MonthCalendar';

// 차트 라이브러리는 첫 화면에 필요하지 않아 필요할 때 불러온다
const DailyExpenseChart = dynamic(
  () => import('./DailyExpenseChart').then((module) => module.DailyExpenseChart),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);

export function AccountBookView() {
  const member = useAuthStore((state) => state.member);
  const currency = currencySymbol(member?.dispatchedCountry);

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  }));
  const [selectedDate, setSelectedDate] = useState(() => toServerDate(today));
  const [addOpen, setAddOpen] = useState(false);

  const balance = useBalance();
  const summary = useMonthlySummary(cursor.year, cursor.month);
  const daily = useDailyTransactions(selectedDate);

  const moveMonth = (delta: number) => {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
    setSelectedDate(toServerDate(next));
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-ink-100 bg-surface p-6 shadow-card">
        <div>
          <p className="text-caption text-ink-500">현재 잔액</p>
          {balance.isPending ? (
            <Skeleton className="mt-1 h-9 w-40" />
          ) : balance.isError ? (
            <p className="mt-1 text-body text-ink-500">잔액을 불러오지 못했어요.</p>
          ) : (
            <p className="mt-1 text-display text-ink-900">
              {formatAmount(balance.data.balance, currency)}
            </p>
          )}
        </div>

        <Button onClick={() => setAddOpen(true)} leftIcon={<Plus aria-hidden className="size-4" />}>
          내역 추가
        </Button>
      </section>

      <p className="text-caption text-ink-500">
        금액은 현지 통화 기준으로 입력해주세요.
        {currency
          ? ` 파견 국가(${member?.dispatchedCountry})를 기준으로 ${currency.trim()} 기호를 붙였어요.`
          : ' 파견 국가를 입력하면 통화 기호를 함께 보여드려요.'}
      </p>

      <section className="rounded-lg border border-ink-100 bg-surface">
        <header className="flex items-center justify-between gap-4 border-b border-ink-100 px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => moveMonth(-1)}
              className="rounded-md p-2 text-ink-500 transition-colors hover:bg-ink-100"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <span className="text-h2 text-ink-900">
              {cursor.year}년 {cursor.month}월
            </span>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => moveMonth(1)}
              className="rounded-md p-2 text-ink-500 transition-colors hover:bg-ink-100"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </div>

          {summary.isSuccess && (
            <p className="text-caption text-ink-500">
              충전 <span className="text-brand-600">{formatAmount(summary.data.totalIncome, currency)}</span>
              {' / '}
              소비 <span className="text-danger">{formatAmount(summary.data.totalExpense, currency)}</span>
            </p>
          )}
        </header>

        {summary.isPending && <Skeleton className="m-4 h-72" />}
        {summary.isError && (
          <ErrorState className="m-4" error={summary.error} onRetry={() => void summary.refetch()} />
        )}

        {summary.isSuccess && (
          <MonthCalendar
            year={cursor.year}
            month={cursor.month}
            summary={summary.data}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            currency={currency}
          />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink-100 bg-surface p-5">
          <h2 className="mb-4 text-h2 text-ink-900">일별 소비</h2>

          {summary.isSuccess ? (
            <DailyExpenseChart
              year={cursor.year}
              month={cursor.month}
              summary={summary.data}
              currency={currency}
              onSelectDate={setSelectedDate}
            />
          ) : (
            <Skeleton className="h-56 w-full" />
          )}
        </section>

        <section className="rounded-lg border border-ink-100 bg-surface p-5">
          <h2 className="mb-4 text-h2 text-ink-900">{formatDate(selectedDate, 'M월 d일')} 내역</h2>

          {daily.isPending && <Skeleton className="h-40 w-full" />}
          {daily.isError && (
            <ErrorState error={daily.error} onRetry={() => void daily.refetch()} />
          )}

          {daily.isSuccess &&
            (daily.data.length === 0 ? (
              <p className="py-10 text-center text-body text-ink-500">이 날은 기록이 없어요.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-ink-100">
                {daily.data.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <span aria-hidden className="text-h2">
                      {CATEGORY_EMOJI[item.category] ?? '📦'}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body text-ink-900">{item.title}</p>
                      <p className="text-caption text-ink-500">
                        {item.categoryName || ACCOUNT_CATEGORY[item.category]}
                        {item.description ? ` · ${item.description}` : ''}
                      </p>
                    </div>

                    <span
                      className={
                        item.type === 'INCOME'
                          ? 'shrink-0 text-body font-medium text-brand-600'
                          : 'shrink-0 text-body font-medium text-danger'
                      }
                    >
                      {item.type === 'INCOME' ? '+' : '-'}
                      {formatAmount(item.amount, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            ))}

          {/* TODO(api): 가계부 내역 수정·삭제 API가 없어 수정 버튼을 제공하지 않는다 */}
        </section>
      </div>

      <AddTransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultDate={selectedDate}
        currency={currency}
      />
    </div>
  );
}
