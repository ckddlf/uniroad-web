'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

export interface InfiniteScrollSentinelProps {
  hasNext: boolean;
  loading: boolean;
  onLoadMore: () => void;
  /** 뷰포트 아래 여유분 — 스크롤이 닿기 전에 미리 불러온다 */
  rootMargin?: string;
  className?: string;
}

/** 커서 페이징 목록 하단에 두고 화면에 들어오면 다음 페이지를 요청한다 */
export function InfiniteScrollSentinel({
  hasNext,
  loading,
  onLoadMore,
  rootMargin = '240px',
  className,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  useEffect(() => {
    const element = ref.current;
    if (!element || !hasNext || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callbackRef.current();
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNext, loading, rootMargin]);

  if (!hasNext && !loading) return null;

  return (
    <div ref={ref} className={cn('flex justify-center py-6', className)}>
      {loading && (
        <span className="flex items-center gap-2 text-caption text-ink-500">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          불러오는 중
        </span>
      )}
    </div>
  );
}
