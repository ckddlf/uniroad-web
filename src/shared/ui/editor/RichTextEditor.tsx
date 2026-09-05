'use client';

import { useCallback, useEffect } from 'react';
import FileHandler from '@tiptap/extension-file-handler';
import { EditorContent, useEditor } from '@tiptap/react';

import { useS3Upload } from '@/shared/hooks/useS3Upload';
import { cn } from '@/shared/lib/cn';
import { useToast } from '@/shared/ui/Toast';
import type { BlogContentJson } from '@/shared/api/types';

import { EditorToolbar } from './EditorToolbar';
import { buildExtensions } from './extensions';

export interface RichTextEditorProps {
  /** 최초 1회 에디터를 채울 내용 (수정 화면 진입 시) */
  initialContent?: BlogContentJson | null;
  onChange: (value: { json: BlogContentJson; html: string }) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder,
  className,
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
        class: 'blog-content focus:outline-none min-h-[24rem] px-4 py-4',
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
        const uploaded = await uploadFiles(files);
        const chain = editor.chain().focus();

        uploaded.forEach((file) => {
          if (!file.fileUrl) return;
          if (pos === undefined) {
            chain.setImage({ src: file.fileUrl, alt: file.fileName });
          } else {
            chain.insertContentAt(pos, {
              type: 'image',
              attrs: { src: file.fileUrl, alt: file.fileName },
            });
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
        className={cn(
          'min-h-[28rem] animate-pulse rounded-md border border-ink-300 bg-canvas',
          className,
        )}
      />
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-md border border-ink-300 bg-surface', className)}>
      <EditorToolbar
        editor={editor}
        uploading={uploading}
        onPickImage={(file) => void insertImages([file])}
      />
      <EditorContent editor={editor} />
      {uploading && (
        <p className="border-t border-ink-100 px-4 py-2 text-caption text-ink-500">
          이미지를 올리는 중이에요…
        </p>
      )}
    </div>
  );
}
