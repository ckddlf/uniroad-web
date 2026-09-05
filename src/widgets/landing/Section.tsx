import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type SectionTone = 'surface' | 'canvas' | 'brand';

const SECTION_TONE: Record<SectionTone, string> = {
  surface: 'bg-surface',
  canvas: 'bg-canvas',
  brand: 'bg-brand-700 text-white',
};

/**
 * 랜딩의 모든 섹션이 공유하는 껍데기.
 * 최대 너비·좌우 패딩·상하 리듬을 한 곳에서 정해 섹션마다 값이 어긋나지 않게 한다.
 */
export function Section({
  id,
  tone = 'canvas',
  className,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(SECTION_TONE[tone], className)}>
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 sm:px-8 sm:py-24 lg:py-28">
        {children}
      </div>
    </section>
  );
}

/** eyebrow → 제목 → 설명. 섹션 머리말의 계층을 고정한다. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="text-label tracking-[0.16em] text-brand-600 uppercase">{eyebrow}</p>
      )}
      <h2 className="text-section text-ink-900 text-balance">{title}</h2>
      {description && (
        <p className={cn('text-lead text-ink-500', align === 'center' ? 'max-w-2xl' : 'max-w-3xl')}>
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * 랜딩에서 쓰는 단 하나의 카드.
 * `tone`은 카드가 얹히는 섹션의 반대 면을 골라 카드 경계가 항상 보이게 한다.
 */
export function Card({
  tone = 'surface',
  className,
  children,
}: {
  tone?: 'surface' | 'canvas';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-ink-100 p-6 shadow-card sm:p-7',
        tone === 'surface' ? 'bg-surface' : 'bg-canvas',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * 세 항목을 나란히 놓는 그리드.
 *
 * 세 칸의 폭을 `minmax(0, 1fr)`로 고정해(= `grid-cols-3`) 항목 안의 긴 낱말이 한 칸만
 * 넓히지 못하게 하고, 그래야 가운데 항목이 어떤 화면에서도 섹션 정중앙에 온다.
 * 열 전환 폭(md)과 간격을 이 한 곳에서 정해, 3분할 섹션끼리 같은 지점에서 같은 간격으로
 * 접히게 한다. md 아래에서 세 칸으로 쥐어짜면 칸이 170px까지 줄어 글이 뭉치므로 쌓는다.
 */
export function ThreeUp({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 [&>*]:min-w-0', className)}>
      {children}
    </div>
  );
}

/** 아이콘을 담는 정사각 타일. 랜딩 전체에서 아이콘 크기·배경을 통일한다. */
export function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
      {children}
    </span>
  );
}
