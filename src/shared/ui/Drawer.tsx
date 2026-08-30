'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** 모바일 메뉴는 left, 필터 패널은 right */
  side?: 'left' | 'right';
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Drawer({ open, onClose, title, side = 'right', footer, className, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-ink-900/40" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 flex w-full max-w-sm flex-col bg-surface shadow-pop',
          side === 'right' ? 'right-0' : 'left-0',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
          {title ? (
            <h2 id={titleId} className="text-h2 text-ink-900">
              {title}
            </h2>
          ) : (
            <span />
          )}

          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="-mr-2 rounded-md p-2 text-ink-500 transition-colors hover:bg-ink-100"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && <div className="border-t border-ink-100 px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
