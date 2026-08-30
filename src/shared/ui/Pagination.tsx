'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

export interface PaginationProps {
  /** 0-based (Spring Page의 number와 동일) */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** 한 번에 보여줄 번호 개수 */
  window?: number;
  className?: string;
}

function buildPages(page: number, totalPages: number, size: number): number[] {
  const half = Math.floor(size / 2);
  let start = Math.max(0, page - half);
  const end = Math.min(totalPages, start + size);
  start = Math.max(0, end - size);
  return Array.from({ length: end - start }, (_, index) => start + index);
}

/** 오프셋 페이징 화면(알림·공지)에서 쓰는 번호 페이지네이션 */
export function Pagination({ page, totalPages, onChange, window: size = 5, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages, size);

  const itemClass = (active: boolean) =>
    cn(
      'inline-flex size-9 items-center justify-center rounded-md text-body transition-colors',
      active ? 'bg-brand-500 font-medium text-white' : 'text-ink-700 hover:bg-ink-100',
      'disabled:cursor-not-allowed disabled:opacity-40',
    );

  return (
    <nav aria-label="페이지 이동" className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className={itemClass(false)}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </button>

      {pages.map((item) => (
        <button
          key={item}
          type="button"
          aria-label={`${item + 1}페이지`}
          aria-current={item === page ? 'page' : undefined}
          onClick={() => onChange(item)}
          className={itemClass(item === page)}
        >
          {item + 1}
        </button>
      ))}

      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className={itemClass(false)}
      >
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}
