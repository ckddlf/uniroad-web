'use client';

import { useRef, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
} from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import { ColorPicker } from './ColorPicker';
import { FONT_SIZES, HIGHLIGHT_SWATCHES, TEXT_COLOR_SWATCHES } from './extensions';

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active ? 'bg-brand-500 text-white' : 'text-ink-700 hover:bg-surface',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-ink-300" />;
}

export interface EditorToolbarProps {
  editor: Editor;
  /** 파일을 고르면 업로드해서 URL을 돌려준다 */
  onPickImage: (file: File) => void;
  uploading?: boolean;
}

export function EditorToolbar({ editor, onPickImage, uploading }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 에디터는 트랜잭션마다 리렌더하지 않는다(성능). 그래서 "지금 굵게인지" 같은 상태는
   * 그리는 시점에 물어보면 한 박자 늦은 값이 나온다. 필요한 값만 구독해 버튼에 반영한다.
   */
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
      fontSize: (instance.getAttributes('textStyle').fontSize as string | undefined) ?? '',
      textColor: (instance.getAttributes('textStyle').color as string | undefined) ?? null,
      highlightColor: (instance.getAttributes('highlight').color as string | undefined) ?? null,
      heading2: instance.isActive('heading', { level: 2 }),
      heading3: instance.isActive('heading', { level: 3 }),
      heading4: instance.isActive('heading', { level: 4 }),
      bold: instance.isActive('bold'),
      italic: instance.isActive('italic'),
      underline: instance.isActive('underline'),
      strike: instance.isActive('strike'),
      highlight: instance.isActive('highlight'),
      alignLeft: instance.isActive({ textAlign: 'left' }),
      alignCenter: instance.isActive({ textAlign: 'center' }),
      alignRight: instance.isActive({ textAlign: 'right' }),
      bulletList: instance.isActive('bulletList'),
      orderedList: instance.isActive('orderedList'),
      blockquote: instance.isActive('blockquote'),
      code: instance.isActive('code'),
      codeBlock: instance.isActive('codeBlock'),
      link: instance.isActive('link'),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('링크 주소를 입력하세요.', previous ?? 'https://');

    // 취소를 누르면 null이 온다 — 이때는 아무것도 건드리지 않는다
    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const headings = [
    { level: 2 as const, Icon: Heading2, active: state?.heading2 },
    { level: 3 as const, Icon: Heading3, active: state?.heading3 },
    { level: 4 as const, Icon: Heading4, active: state?.heading4 },
  ];

  const alignments = [
    { value: 'left' as const, Icon: AlignLeft, label: '왼쪽 정렬', active: state?.alignLeft },
    { value: 'center' as const, Icon: AlignCenter, label: '가운데 정렬', active: state?.alignCenter },
    { value: 'right' as const, Icon: AlignRight, label: '오른쪽 정렬', active: state?.alignRight },
  ];

  return (
    /* 본문과 같은 흰색이면 경계가 흐려진다 — 배경을 한 톤 눌러 도구 모음임을 드러낸다.
       고정은 감싼 셸(RichTextEditor)이 맡으므로 여기서 sticky를 쓰지 않는다. */
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-ink-300 bg-canvas px-2 py-1.5 shadow-sm">
      <ToolbarButton
        label="실행 취소"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!state?.canUndo}
      >
        <Undo2 aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="다시 실행"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!state?.canRedo}
      >
        <Redo2 aria-hidden className="size-4" />
      </ToolbarButton>

      <Divider />

      <label className="sr-only" htmlFor="editor-font-size">
        글씨 크기
      </label>
      <select
        id="editor-font-size"
        value={state?.fontSize ?? ''}
        onChange={(event) => {
          const size = event.target.value;
          if (size === '') {
            editor.chain().focus().unsetFontSize().run();
            return;
          }
          editor.chain().focus().setFontSize(size).run();
        }}
        title="글씨 크기"
        className="h-8 shrink-0 rounded-md border border-ink-300 bg-surface px-2 text-caption text-ink-700"
      >
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
            {size.value === '' ? '' : ` (${size.value.replace('px', '')})`}
          </option>
        ))}
      </select>

      {headings.map(({ level, Icon, active }) => (
        <ToolbarButton
          key={level}
          label={`제목 ${level}`}
          active={active}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          <Icon aria-hidden className="size-4" />
        </ToolbarButton>
      ))}

      <Divider />

      <ToolbarButton
        label="굵게"
        active={state?.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="기울임"
        active={state?.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="밑줄"
        active={state?.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="취소선"
        active={state?.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough aria-hidden className="size-4" />
      </ToolbarButton>

      <Divider />

      <ColorPicker
        label="글자 색"
        icon={<Baseline aria-hidden className="size-4" />}
        value={state?.textColor ?? null}
        swatches={TEXT_COLOR_SWATCHES}
        onSelect={(color) => editor.chain().focus().setColor(color).run()}
        onClear={() => editor.chain().focus().unsetColor().run()}
        clearLabel="기본 색으로"
      />
      <ColorPicker
        label="형광펜"
        icon={<Highlighter aria-hidden className="size-4" />}
        value={state?.highlightColor ?? null}
        swatches={HIGHLIGHT_SWATCHES}
        onSelect={(color) => editor.chain().focus().setHighlight({ color }).run()}
        onClear={() => editor.chain().focus().unsetHighlight().run()}
        clearLabel="형광펜 지우기"
      />

      <Divider />

      {alignments.map(({ value, Icon, label, active }) => (
        <ToolbarButton
          key={value}
          label={label}
          active={active}
          onClick={() => editor.chain().focus().setTextAlign(value).run()}
        >
          <Icon aria-hidden className="size-4" />
        </ToolbarButton>
      ))}

      <Divider />

      <ToolbarButton
        label="글머리 목록"
        active={state?.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="번호 목록"
        active={state?.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="인용"
        active={state?.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="구분선"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus aria-hidden className="size-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="코드 (한 줄)"
        active={state?.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="코드 블록"
        active={state?.codeBlock}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 aria-hidden className="size-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="링크" active={state?.link} onClick={setLink}>
        <Link2 aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="표 넣기 (3×3)"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={uploading ? '이미지 올리는 중' : '이미지 넣기'}
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus aria-hidden className="size-4" />
      </ToolbarButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={false}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPickImage(file);
          // 같은 파일을 연달아 골라도 change가 다시 뜨도록 비운다
          event.target.value = '';
        }}
      />
    </div>
  );
}
