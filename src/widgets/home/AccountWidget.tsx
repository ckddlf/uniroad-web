'use client';

import { Wallet } from 'lucide-react';

import { currencySymbol } from '@/entities/account/currency';
import { useBalance, useMonthlySummary } from '@/features/account-book/api';
import { formatAmount } from '@/shared/lib/format';
import { useAuthStore } from '@/shared/store/authStore';
import { Skeleton } from '@/shared/ui';

import { WidgetCard } from './WidgetCard';

export function AccountWidget() {
  const member = useAuthStore((state) => state.member);
  const currency = currencySymbol(member?.dispatchedCountry);

  const now = new Date();
  const balance = useBalance();
  const summary = useMonthlySummary(now.getFullYear(), now.getMonth() + 1);

  return (
    <WidgetCard
      title="이번 달 가계부"
      icon={<Wallet aria-hidden className="size-5 text-ink-500" />}
      href="/account-book"
    >
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <p className="text-caption text-ink-500">잔액</p>
          {balance.isPending ? (
            <Skeleton className="mt-1 h-8 w-28" />
          ) : balance.isError ? (
            <p className="mt-1 text-body text-ink-500">-</p>
          ) : (
            <p className="mt-1 text-h1 text-ink-900">
              {formatAmount(balance.data.balance, currency)}
            </p>
          )}
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-caption text-ink-500">충전</p>
            <p className="mt-1 text-body font-medium text-brand-600">
              {summary.isSuccess ? formatAmount(summary.data.totalIncome, currency) : '-'}
            </p>
          </div>
          <div>
            <p className="text-caption text-ink-500">소비</p>
            <p className="mt-1 text-body font-medium text-danger">
              {summary.isSuccess ? formatAmount(summary.data.totalExpense, currency) : '-'}
            </p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
