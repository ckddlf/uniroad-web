'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
import FileHandler from '@tiptap/extension-file-handler';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';

import { useS3Upload } from '@/shared/hooks/useS3Upload';
import { cn } from '@/shared/lib/cn';
import { readImageSize } from '@/shared/lib/image';
import { useToast } from '@/shared/ui/Toast';
import type { BlogContentJson } from '@/shared/api/types';

import { EditorToolbar } from './EditorToolbar';
import { ImageToolbar } from './ImageToolbar';
import { TableMenu } from './TableMenu';
import { buildExtensions } from './extensions';

/**
 * 에디터 셸의 기본 높이.
 *
 * 본문이 길어져도 상자 자체는 커지지 않는다. 안쪽 본문만 스크롤하므로 툴바가 화면 밖으로
 * 밀려나지 않고, 글을 고치려고 페이지를 위로 올릴 일도 없다.
 * 화면 높이에서 관리자 셸 여백과 위쪽 입력칸(제목·주소) 몫을 뺀 값이다.
 * className으로 덮어쓸 수 있다 — cn이 tailwind-merge라 나중에 온 높이가 이긴다.
 */
const EDITOR_SHELL_HEIGHT = 'h-[calc(100dvh-10rem)] min-h-[24rem]';

export interface RichTextEditorProps {
  /** 최초 1회 에디터를 채울 내용 (수정 화면 진입 시) */
  initialContent?: BlogContentJson | null;
  onChange: (value: { json: BlogContentJson; html: string }) => void;
  placeholder?: string;
  className?: string;
  /** 상태 표시줄 오른쪽에 덧붙일 것 (예: 임시저장 시각) */
  statusNote?: ReactNode;
}

/**
 * 본문 아래 상태 표시줄.
 *
 * 글자 수와 예상 읽는 시간을 늘 보여 준다. 검색 노출용 설명이나 목록 카드 분량을 가늠할 때,
 * 그리고 "이 정도면 충분히 썼나"를 판단할 때 쓰인다.
 * 한국어는 분당 500자 남짓 읽는다고 보고 계산한다.
 */
function EditorStatusBar({
  editor,
  uploading,
  extra,
}: {
  editor: Editor;
  uploading?: boolean;
  extra?: ReactNode;
}) {
  const counts = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      characters: instance.storage.characterCount.characters() as number,
      words: instance.storage.characterCount.words() as number,
    }),
  });

  const characters = counts?.characters ?? 0;
  const minutes = Math.max(1, Math.round(characters / 500));

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-ink-100 bg-canvas px-4 py-2 text-caption text-ink-500">
      <span>
        {characters.toLocaleString()}자 · 낱말 {(counts?.words ?? 0).toLocaleString()} · 읽는 데 약{' '}
        {minutes}분
      </span>
      <span className="flex items-center gap-3">
        {uploading && <span>이미지를 올리는 중이에요…</span>}
        {extra}
      </span>
    </div>
  );
}

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder,
  className,
  statusNote,
}: RichTextEditorProps) {
  const toast = useToast();
  const { uploadFiles, uploading } = useS3Upload('public');

  const editor = useEditor({
    // Next.js는 서버에서 한 번 렌더하므로 즉시 렌더하면 하이드레이션이 어긋난다
    immediatelyRender: false,
    extensions: [
      ...buildExtensions({ placeholder }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        onDrop: (currentEditor, files, pos) => {
          void insertImages(files, pos);
        },
        onPaste: (currentEditor, files) => {
          void insertImages(files);
        },
      }),
    ],
    content: initialContent ?? '',
    editorProps: {
      attributes: {
        class: 'blog-content focus:outline-none flex-1 px-4 py-4',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange({ json: instance.getJSON() as BlogContentJson, html: instance.getHTML() });
    },
  });

  /**
   * S3에 올린 뒤 받은 주소로 이미지를 꽂는다.
   * 업로드 전에는 아무것도 넣지 않는다 — blob: 주소가 본문에 남으면
   * 저장 직후에는 보이다가 새로고침하면 깨지기 때문이다.
   */
  const insertImages = useCallback(
    async (files: File[], pos?: number) => {
      if (!editor || files.length === 0) return;

      try {
        // 업로드와 나란히 크기를 읽어둔다. width/height가 있어야 이미지가 늦게 와도 글이 밀리지 않는다.
        const [uploaded, sizes] = await Promise.all([
          uploadFiles(files),
          Promise.all(files.map((file) => readImageSize(file))),
        ]);
        const chain = editor.chain().focus();

        uploaded.forEach((file, index) => {
          if (!file.fileUrl) return;
          const size = sizes[index];
          const attrs = {
            src: file.fileUrl,
            alt: file.fileName,
            ...(size ? { width: size.width, height: size.height } : {}),
          };

          if (pos === undefined) {
            chain.setImage(attrs);
          } else {
            chain.insertContentAt(pos, { type: 'image', attrs });
          }
        });

        chain.run();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '이미지를 올리지 못했어요.');
      }
    },
    [editor, toast, uploadFiles],
  );

  /**
   * 수정 화면은 글을 비동기로 받아오므로, 에디터가 만들어진 뒤에 내용이 도착한다.
   * 그 한 번만 채워 넣고, 이후 타이핑을 덮어쓰지 않도록 내용이 빈 상태에서만 넣는다.
   */
  useEffect(() => {
    if (!editor || !initialContent) return;
    if (!editor.isEmpty) return;
    editor.commands.setContent(initialContent);
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div
        className={cn(EDITOR_SHELL_HEIGHT, 'animate-pulse rounded-md border border-ink-300 bg-canvas', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        EDITOR_SHELL_HEIGHT,
        'flex flex-col overflow-hidden rounded-md border border-ink-300 bg-surface',
        className,
      )}
    >
      <div className="shrink-0">
        <EditorToolbar
          editor={editor}
          uploading={uploading}
          onPickImage={(file) => void insertImages([file])}
        />
        <TableMenu editor={editor} />
        <ImageToolbar editor={editor} />
      </div>

      {/* 스크롤은 여기서만 일어난다 — 글이 길어져도 위의 툴바는 자리를 지킨다 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-thin">
        {/* 글이 짧아도 본문이 남는 높이를 채워야 빈 아래쪽을 눌러도 커서가 잡힌다 */}
        <EditorContent editor={editor} className="flex flex-1 flex-col" />
      </div>

      <EditorStatusBar editor={editor} uploading={uploading} extra={statusNote} />
    </div>
  );
}
