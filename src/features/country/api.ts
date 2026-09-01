'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CountryResponse } from '@/shared/api/types';
import { EUROPEAN_COUNTRIES } from '@/shared/lib/constants';
import type { SelectOption } from '@/shared/ui';

/** 국가 목록은 거의 바뀌지 않으므로 오래 캐시한다 */
export function useCountries() {
  return useQuery({
    queryKey: queryKeys.country.list(),
    queryFn: () => get<CountryResponse[]>(endpoints.country.list),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * 국가 선택 드롭다운에 넣을 옵션.
 *
 * 서버 국가 목록(`/api/countries`)이 비어 있거나 실패하면 유럽 국가 목록으로 채운다.
 * 서버 테이블에 시드 데이터가 없어 목록이 비면 아무것도 고를 수 없었기 때문이다.
 * 목록에 없는 나라는 폼에서 "직접 입력"으로 적을 수 있다(`SelectOrCustom`).
 */
export function useCountryOptions() {
  const query = useCountries();
  const serverCountries = query.data;

  const options = useMemo<SelectOption[]>(() => {
    const names = serverCountries?.length
      ? serverCountries.map((country) => country.name)
      : [...EUROPEAN_COUNTRIES];

    return names.map((name) => ({ value: name, label: name }));
  }, [serverCountries]);

  const usingFallback = (serverCountries?.length ?? 0) === 0;

  return {
    options,
    isPending: query.isPending,
    /** 서버 목록 대신 유럽 국가 목록을 쓰는 중인지 */
    usingFallback,
    /** 폼에서 국가 필드 아래에 띄울 안내 (폴백일 때만) */
    fallbackHint:
      usingFallback && !query.isPending
        ? '목록에 없는 나라는 "직접 입력"을 골라 적어주세요.'
        : undefined,
  };
}
