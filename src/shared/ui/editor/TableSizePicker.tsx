'use client';

import { useEffect, useRef, useState } from 'react';
import { Table as TableIcon } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

/** 끌어서 고를 수 있는 최대 크기. 워드·노션도 이 정도에서 끊고 그보다 크면 숫자로 받는다. */
const GRID_ROWS = 8;
const GRID_COLS = 10;

/** 숫자로 직접 넣을 때의 상한. 표가 글 폭을 넘어가면 읽기 어려워져 열은 더 좁게 잡는다. */
const MAX_ROWS = 50;
const MAX_COLS = 20;

export interface TableSizePickerProps {
  onInsert: (size: { rows: number; cols: number; withHeaderRow: boolean }) => void;
}

function clamp(value: number, max: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.round(value), 1), max);
}

/**
 * 표 크기를 고르고 넣는 버튼.
 *
 * 칸 위를 지나가면 그만큼 칠해지고, 누르면 그 크기로 들어간다 — 워드·구글 문서·노션이 모두
 * 쓰는 방식이라 따로 배울 것이 없다. 격자보다 큰 표는 아래 숫자 칸으로 받는다.
 * 넣은 뒤에 행·열을 더하거나 지우는 일은 표 도구 모음(TableMenu)이 맡는다.
 */
export function TableSizePicker({ onInsert }: TableSizePickerProps) {
  const [open, setOpen] = useState(false);
  /** 격자에서 지금 가리키는 칸 (1-based). 아직 아무 데도 없으면 0 */
  const [hover, setHover] = useState({ rows: 0, cols: 0 });
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [customRows, setCustomRows] = useState('3');
  const [customCols, setCustomCols] = useState('3');
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

  // 다음에 열 때 지난번 자취가 칠해져 있으면 헷갈린다
  useEffect(() => {
    if (!open) setHover({ rows: 0, cols: 0 });
  }, [open]);

  const insert = (rows: number, cols: number) => {
    onInsert({ rows, cols, withHeaderRow });
    setOpen(false);
  };

  /** 격자를 키보드로도 고를 수 있게 한다 — 마우스 없이 쓰는 사람에게 격자는 그림일 뿐이다 */
  const handleGridKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[event.key];

    if (move) {
      event.preventDefault();
      setHover((previous) => ({
        rows: clamp((previous.rows || 1) + move[0], GRID_ROWS),
        cols: clamp((previous.cols || 1) + move[1], GRID_COLS),
      }));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (hover.rows === 0) return;
      event.preventDefault();
      insert(hover.rows, hover.cols);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        title="표 넣기"
        aria-label="표 넣기"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-700 transition-colors',
          open ? 'bg-surface' : 'hover:bg-surface',
        )}
      >
        <TableIcon aria-hidden className="size-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="표 넣기"
          className="absolute left-0 top-full z-20 mt-1 w-60 rounded-md border border-ink-300 bg-surface p-2 shadow-pop"
        >
          <div
            role="grid"
            aria-label={`표 크기 고르기 (최대 ${GRID_ROWS}행 ${GRID_COLS}열)`}
            tabIndex={0}
            onKeyDown={handleGridKeyDown}
            onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
            className="grid gap-0.5 rounded-md p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
          >
            {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
              const row = Math.floor(index / GRID_COLS) + 1;
              const col = (index % GRID_COLS) + 1;
              const filled = row <= hover.rows && col <= hover.cols;

              return (
                <button
                  key={index}
                  type="button"
                  // 칸 하나하나가 탭 정거장이 되면 80번을 눌러야 빠져나간다 — 이동은 화살표가 맡는다
                  tabIndex={-1}
                  aria-label={`${row}행 ${col}열`}
                  onMouseEnter={() => setHover({ rows: row, cols: col })}
                  onFocus={() => setHover({ rows: row, cols: col })}
                  onClick={() => insert(row, col)}
                  className={cn(
                    'aspect-square rounded-[2px] border transition-colors',
                    filled ? 'border-brand-500 bg-brand-500/25' : 'border-ink-300 bg-canvas',
                  )}
                />
              );
            })}
          </div>

          <p className="mt-1.5 text-center text-caption text-ink-500" aria-live="polite">
            {hover.rows === 0 ? '크기를 고르세요' : `${hover.rows}행 × ${hover.cols}열`}
          </p>

          <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-caption text-ink-700 hover:bg-canvas">
            <input
              type="checkbox"
              checked={withHeaderRow}
              onChange={(event) => setWithHeaderRow(event.target.checked)}
              className="size-3.5 accent-brand-500"
            />
            첫 줄을 제목 행으로
          </label>

          {/* 격자보다 큰 표 — 12행 30열 같은 건 끌어서 고를 수 없다 */}
          <div className="mt-1 flex items-center gap-1 border-t border-ink-100 pt-2">
            <input
              type="number"
              min={1}
              max={MAX_ROWS}
              value={customRows}
              onChange={(event) => setCustomRows(event.target.value)}
              aria-label="행 수"
              className="h-8 w-12 rounded-md border border-ink-300 bg-surface px-1.5 text-center text-caption text-ink-700"
            />
            <span className="text-caption text-ink-500">행 ×</span>
            <input
              type="number"
              min={1}
              max={MAX_COLS}
              value={customCols}
              onChange={(event) => setCustomCols(event.target.value)}
              aria-label="열 수"
              className="h-8 w-12 rounded-md border border-ink-300 bg-surface px-1.5 text-center text-caption text-ink-700"
            />
            <span className="text-caption text-ink-500">열</span>
            <button
              type="button"
              onClick={() =>
                insert(clamp(Number(customRows), MAX_ROWS), clamp(Number(customCols), MAX_COLS))
              }
              className="ml-auto h-8 shrink-0 rounded-md bg-brand-500 px-2.5 text-caption font-medium text-white transition-colors hover:bg-brand-600"
            >
              넣기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
