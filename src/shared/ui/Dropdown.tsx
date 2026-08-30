'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

export interface DropdownProps {
  /** 열기 버튼으로 쓸 요소 */
  trigger: ReactNode;
  align?: 'start' | 'end';
  label?: string;
  className?: string;
  menuClassName?: string;
  children: ReactNode;
}

/** 헤더 프로필·거래 메뉴처럼 클릭으로 여닫는 메뉴 */
export function Dropdown({
  trigger,
  align = 'end',
  label,
  className,
  menuClassName,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;

    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    items[nextIndex].focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          onKeyDown={handleMenuKeyDown}
          onClick={() => setOpen(false)}
          className={cn(
            'absolute top-full z-40 mt-2 min-w-48 overflow-hidden rounded-md border border-ink-100 bg-surface py-1 shadow-pop',
            align === 'end' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  onClick?: () => void;
  /** 이동만 하는 항목은 링크로 렌더한다 */
  href?: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  children: ReactNode;
}

export function DropdownItem({
  onClick,
  href,
  icon,
  tone = 'default',
  disabled,
  children,
}: DropdownItemProps) {
  const className = cn(
    'flex w-full items-center gap-2 px-4 py-2.5 text-left text-body transition-colors',
    tone === 'danger' ? 'text-danger hover:bg-danger-bg' : 'text-ink-700 hover:bg-ink-100',
    'disabled:cursor-not-allowed disabled:opacity-50',
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" className={className}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" disabled={disabled} onClick={onClick} className={className}>
      {icon}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div role="separator" className="my-1 h-px bg-ink-100" />;
}
