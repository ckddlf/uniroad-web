'use client';

import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CountryResponse } from '@/shared/api/types';

/** 국가 목록은 거의 바뀌지 않으므로 오래 캐시한다 */
export function useCountries() {
  return useQuery({
    queryKey: queryKeys.country.list(),
    queryFn: () => get<CountryResponse[]>(endpoints.country.list),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
