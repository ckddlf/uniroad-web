import { cn } from '@/shared/lib/cn';

export interface SkeletonProps {
  className?: string;
}

/** 로딩 중 자리를 지키는 회색 블록 */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-ink-100', className)} />;
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

/** 목록 로딩 화면에서 반복해서 쓰는 카드 스켈레톤 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border border-ink-100 bg-surface p-4', className)}>
      <Skeleton className="mb-3 h-32 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
