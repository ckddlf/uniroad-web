'use client';

import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Columns3,
  Combine,
  PaintBucket,
  Rows3,
  Split,
  Trash2,
} from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import { ColorPicker } from './ColorPicker';
import { HIGHLIGHT_SWATCHES, TABLE_BORDERS, type TableBorder } from './extensions';

function MenuButton({
  label,
  onClick,
  children,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
        danger ? 'text-danger hover:bg-danger/10' : 'text-ink-700 hover:bg-surface',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-ink-300" />;
}

/**
 * 표 안에 커서가 있을 때만 나타나는 표 전용 도구.
 *
 * 표를 다루는 버튼(행·열 추가, 칸 합치기…)은 평소에는 쓸 일이 없어서, 늘 띄워 두면
 * 본문 도구 모음만 복잡해진다. 표를 건드리는 순간에만 보여 준다.
 */
export function TableMenu({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      inTable: instance.isActive('table'),
      border: (instance.getAttributes('table').borderStyle as TableBorder | undefined) ?? 'all',
      cellColor: (instance.getAttributes('tableCell').backgroundColor ??
        instance.getAttributes('tableHeader').backgroundColor) as string | undefined,
      // 합치기·나누기는 고른 칸에 따라 되기도 안 되기도 한다 — 눌러 보고 아무 일도 없으면 고장으로 읽힌다
      canMerge: instance.can().mergeCells(),
      canSplit: instance.can().splitCell(),
      canDeleteRow: instance.can().deleteRow(),
      canDeleteColumn: instance.can().deleteColumn(),
    }),
  });

  if (!state?.inTable) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-ink-300 bg-canvas px-2 py-1.5">
      <span className="mr-1 shrink-0 text-caption font-medium text-ink-500">표</span>

      <MenuButton label="위에 행 추가" onClick={() => editor.chain().focus().addRowBefore().run()}>
        <ArrowUpToLine aria-hidden className="size-4" />
      </MenuButton>
      <MenuButton label="아래에 행 추가" onClick={() => editor.chain().focus().addRowAfter().run()}>
        <ArrowDownToLine aria-hidden className="size-4" />
      </MenuButton>
      <MenuButton
        label="왼쪽에 열 추가"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
      >
        <ArrowLeftToLine aria-hidden className="size-4" />
      </MenuButton>
      <MenuButton
        label="오른쪽에 열 추가"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <ArrowRightToLine aria-hidden className="size-4" />
      </MenuButton>

      <Divider />

      <MenuButton
        label="제목 행 켜고 끄기"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        <Rows3 aria-hidden className="size-4" />
      </MenuButton>
      <MenuButton
        label="제목 열 켜고 끄기"
        onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
      >
        <Columns3 aria-hidden className="size-4" />
      </MenuButton>
      <MenuButton
        label="칸 합치기"
        disabled={!state.canMerge}
        onClick={() => editor.chain().focus().mergeCells().run()}
      >
        <Combine aria-hidden className="size-4" />
      </MenuButton>
      <MenuButton
        label="칸 나누기"
        disabled={!state.canSplit}
        onClick={() => editor.chain().focus().splitCell().run()}
      >
        <Split aria-hidden className="size-4" />
      </MenuButton>

      <ColorPicker
        label="칸 배경색"
        icon={<PaintBucket aria-hidden className="size-4" />}
        value={state.cellColor ?? null}
        swatches={HIGHLIGHT_SWATCHES}
        onSelect={(color) =>
          editor.chain().focus().setCellAttribute('backgroundColor', color).run()
        }
        onClear={() => editor.chain().focus().setCellAttribute('backgroundColor', null).run()}
        clearLabel="색 지우기"
      />

      <Divider />

      <label className="sr-only" htmlFor="table-border-style">
        표 테두리
      </label>
      <select
        id="table-border-style"
        value={state.border}
        onChange={(event) =>
          editor
            .chain()
            .focus()
            .updateAttributes('table', { borderStyle: event.target.value })
            .run()
        }
        className="h-8 shrink-0 rounded-md border border-ink-300 bg-surface px-2 text-caption text-ink-700"
      >
        {TABLE_BORDERS.map((border) => (
          <option key={border.value} value={border.value}>
            {border.label}
          </option>
        ))}
      </select>

      <Divider />

      <MenuButton
        label="행 삭제"
        disabled={!state.canDeleteRow}
        onClick={() => editor.chain().focus().deleteRow().run()}
        danger
      >
        <span className="text-caption font-medium">행−</span>
      </MenuButton>
      <MenuButton
        label="열 삭제"
        disabled={!state.canDeleteColumn}
        onClick={() => editor.chain().focus().deleteColumn().run()}
        danger
      >
        <span className="text-caption font-medium">열−</span>
      </MenuButton>
      <MenuButton label="표 삭제" onClick={() => editor.chain().focus().deleteTable().run()} danger>
        <Trash2 aria-hidden className="size-4" />
      </MenuButton>
    </div>
  );
}
