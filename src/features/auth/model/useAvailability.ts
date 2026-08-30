'use client';

import { useEffect, useRef, useState } from 'react';

import { isApiError } from '@/shared/api/errors';

export type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'error';

/**
 * 아이디·이메일 중복 확인.
 * 중복 확인 API는 2xx면 사용 가능, 4xx면 이미 사용 중이라는 뜻이다.
 *
 * @param value  검사할 값
 * @param enabled 형식 검증을 통과했을 때만 서버를 부른다
 * @param check  실패 시 reject하는 확인 함수
 */
export function useAvailability(
  value: string,
  enabled: boolean,
  check: (value: string) => Promise<unknown>,
  delay = 500,
): AvailabilityState {
  const [state, setState] = useState<AvailabilityState>('idle');
  const requestId = useRef(0);
  const checkRef = useRef(check);
  checkRef.current = check;

  useEffect(() => {
    if (!enabled || value.trim() === '') {
      setState('idle');
      return;
    }

    setState('checking');
    const id = ++requestId.current;

    const timer = window.setTimeout(async () => {
      try {
        await checkRef.current(value);
        if (id === requestId.current) setState('available');
      } catch (error) {
        if (id !== requestId.current) return;
        // 4xx는 중복, 그 밖의 실패는 확인 불가로 구분한다
        setState(isApiError(error) && error.status !== null && error.status < 500 ? 'taken' : 'error');
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, enabled, delay]);

  return state;
}
