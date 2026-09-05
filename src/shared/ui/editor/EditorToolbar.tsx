'use client';

import { useRef, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
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
  Underline,
  Undo2,
} from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import { HIGHLIGHT_COLORS } from './extensions';

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
        active ? 'bg-brand-500 text-white' : 'text-ink-700 hover:bg-ink-100',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-ink-100" />;
}

export interface EditorToolbarProps {
  editor: Editor;
  /** 파일을 고르면 업로드해서 URL을 돌려준다 */
  onPickImage: (file: File) => void;
  uploading?: boolean;
}

export function EditorToolbar({ editor, onPickImage, uploading }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-ink-100 bg-surface px-2 py-1.5">
      <ToolbarButton
        label="실행 취소"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="다시 실행"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 aria-hidden className="size-4" />
      </ToolbarButton>

      <Divider />

      {([2, 3, 4] as const).map((level) => {
        const Icon = level === 2 ? Heading2 : level === 3 ? Heading3 : Heading4;
        return (
          <ToolbarButton
            key={level}
            label={`제목 ${level}`}
            active={editor.isActive('heading', { level })}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          >
            <Icon aria-hidden className="size-4" />
          </ToolbarButton>
        );
      })}

      <Divider />

      <ToolbarButton
        label="굵게"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="기울임"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="밑줄"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="취소선"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough aria-hidden className="size-4" />
      </ToolbarButton>

      <Divider />

      {/* 형광펜 — 같은 색을 다시 누르면 꺼진다 */}
      <span aria-hidden className="inline-flex items-center pl-1 text-ink-500">
        <Highlighter className="size-4" />
      </span>
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          title={`형광펜 ${color.label}`}
          aria-label={`형광펜 ${color.label}`}
          aria-pressed={editor.isActive('highlight', { color: color.value })}
          onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
          className={cn(
            'ml-0.5 size-5 shrink-0 rounded-full border transition-transform hover:scale-110',
            `blog-highlight-swatch-${color.value}`,
            editor.isActive('highlight', { color: color.value })
              ? 'border-ink-900'
              : 'border-ink-300',
          )}
        />
      ))}

      <Divider />

      <ToolbarButton
        label="글머리 목록"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="번호 목록"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered aria-hidden className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="인용"
        active={editor.isActive('blockquote')}
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

      <ToolbarButton label="링크" active={editor.isActive('link')} onClick={setLink}>
        <Link2 aria-hidden className="size-4" />
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
