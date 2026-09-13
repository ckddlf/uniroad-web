'use client';

import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';

import { inputBaseClass, inputStateClass } from '@/shared/ui/Field';
import { cn } from '@/shared/lib/cn';

/**
 * 본문에서 이미지를 고르면 나타나는 설명(alt) 입력 칸.
 *
 * 업로드할 때는 파일명이 alt로 들어간다. IMG_4821.jpg 같은 값은 이미지 검색에도,
 * 화면을 읽어 주는 사용자에게도 아무것도 알려주지 않는다. 이미지를 고른 그 자리에서
 * 고칠 수 있어야 실제로 고쳐진다.
 *
 * 에디터는 트랜잭션마다 리렌더하지 않게 설정돼 있어(성능), 선택이 바뀐 것을 알려면
 * useEditorState로 필요한 값만 구독해야 한다.
 */
export function ImageAltField({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      selected: instance.isActive('image'),
      alt: (instance.getAttributes('image').alt as string | undefined) ?? '',
    }),
  });

  if (!state?.selected) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 bg-canvas px-4 py-2">
      <label htmlFor="editor-image-alt" className="shrink-0 text-caption text-ink-500">
        이미지 설명
      </label>
      <input
        id="editor-image-alt"
        type="text"
        value={state.alt}
        placeholder="무엇이 보이는지 한 줄로 적어주세요"
        maxLength={200}
        onChange={(event) =>
          // 선택을 유지한 채 속성만 바꾼다. focus()를 부르면 입력 칸에서 커서가 빠져나간다.
          editor.commands.updateAttributes('image', { alt: event.target.value })
        }
        className={cn(inputBaseClass, inputStateClass(false), 'h-8 min-w-0 flex-1 text-caption')}
      />
    </div>
  );
}
