'use client';

import { useId, useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface TooltipProps {
  content: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
  children: ReactNode;
}

/** 마우스 호버와 키보드 포커스 양쪽에서 열린다 */
export function Tooltip({ content, side = 'top', className, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? tooltipId : undefined} className="inline-flex">
        {children}
      </span>

      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          className={cn(
            'pointer-events-none absolute left-1/2 z-40 w-max max-w-64 -translate-x-1/2 rounded-md bg-ink-900 px-2.5 py-1.5 text-caption text-white shadow-pop',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
