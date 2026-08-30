'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

export type ModalSize = 'sm' | 'md' | 'lg';

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** 하단 버튼 영역 */
  footer?: ReactNode;
  size?: ModalSize;
  /** 되돌릴 수 없는 확인 모달은 배경 클릭으로 닫히지 않게 한다 */
  dismissOnBackdrop?: boolean;
  hideCloseButton?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  dismissOnBackdrop = true,
  hideCloseButton = false,
  className,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={dismissOnBackdrop ? onClose : undefined}
        className="absolute inset-0 bg-ink-900/40"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-lg bg-surface shadow-pop',
          SIZE[size],
          className,
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div className="flex flex-col gap-1">
              {title && (
                <h2 id={titleId} className="text-h2 text-ink-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="text-body text-ink-500">
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="-mt-1 -mr-2 rounded-md p-2 text-ink-500 transition-colors hover:bg-ink-100"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
        )}

        {children && <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>}

        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
