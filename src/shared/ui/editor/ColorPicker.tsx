'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface ColorPickerProps {
  label: string;
  /** 버튼 안에 그릴 아이콘 */
  icon: ReactNode;
  /** 지금 적용된 색 — 아이콘 아래 띠로 보여준다 */
  value?: string | null;
  /** 자주 쓰는 색 */
  swatches: readonly string[];
  onSelect: (color: string) => void;
  onClear: () => void;
  clearLabel: string;
}

/**
 * 색 고르기 버튼.
 *
 * 자주 쓰는 색은 한 번에 누르고, 그 밖의 색은 브라우저 색상판(input[type=color])에서 고른다.
 * 색상판은 OS가 띄우는 것이라 RGB·HSB·스포이드를 그대로 쓸 수 있다.
 */
export function ColorPicker({
  label,
  icon,
  value,
  swatches,
  onSelect,
  onClear,
  clearLabel,
}: ColorPickerProps) {
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'inline-flex size-8 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md transition-colors',
          open ? 'bg-surface' : 'hover:bg-surface',
          'text-ink-700',
        )}
      >
        {icon}
        {/* 지금 색을 아이콘 아래 띠로 보여준다 — 눌러 보지 않고도 무슨 색인지 안다 */}
        <span
          aria-hidden
          className="h-1 w-4 rounded-full border border-ink-300"
          style={value ? { backgroundColor: value, borderColor: 'transparent' } : undefined}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-ink-300 bg-surface p-2 shadow-pop"
        >
          <div className="grid grid-cols-4 gap-1.5">
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                aria-label={`${label} ${color}`}
                onClick={() => {
                  onSelect(color);
                  setOpen(false);
                }}
                className={cn(
                  'size-8 rounded-md border transition-transform hover:scale-105',
                  value === color ? 'border-ink-900' : 'border-ink-300',
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <label className="mt-2 flex cursor-pointer items-center justify-between gap-2 rounded-md border border-ink-100 px-2 py-1.5 text-caption text-ink-700 hover:bg-canvas">
            직접 고르기
            <input
              type="color"
              value={value ?? '#000000'}
              // change는 색상판을 닫을 때만 오는 브라우저가 있어, 끌고 있는 동안에도 반영되게 input을 쓴다
              onChange={(event) => onSelect(event.target.value)}
              className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-caption text-ink-500 hover:bg-canvas"
          >
            {clearLabel}
          </button>
        </div>
      )}
    </div>
  );
}
