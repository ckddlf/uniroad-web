'use client';

import { useEffect } from 'react';

/** 오버레이가 열린 동안 뒤쪽 페이지가 스크롤되지 않게 막는다 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
