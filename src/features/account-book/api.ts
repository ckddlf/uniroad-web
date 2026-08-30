'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { get, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  AccountBookRequest,
  AccountBookResponse,
  BalanceResponse,
  MonthlySummaryResponse,
} from '@/shared/api/types';

export function useBalance() {
  return useQuery({
    queryKey: queryKeys.accountBook.balance(),
    queryFn: () => get<BalanceResponse>(endpoints.accountBook.balance),
  });
}

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.accountBook.summary(year, month),
    queryFn: () =>
      get<MonthlySummaryResponse>(endpoints.accountBook.summary, { year, month }),
  });
}

export function useDailyTransactions(date: string) {
  return useQuery({
    queryKey: queryKeys.accountBook.daily(date),
    queryFn: () => get<AccountBookResponse[]>(endpoints.accountBook.daily, { date }),
    enabled: date !== '',
  });
}

/** 수정·삭제 API가 없어 추가만 가능하다 */
export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AccountBookRequest) => post<number>(endpoints.accountBook.root, body),
    onSuccess: () => {
      // 잔액·월 요약·해당 날짜 내역이 모두 바뀐다
      void queryClient.invalidateQueries({ queryKey: queryKeys.accountBook.all() });
    },
  });
}
