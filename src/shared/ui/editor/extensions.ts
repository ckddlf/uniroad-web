import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import type { Extensions } from '@tiptap/react';

/**
 * 형광펜 색.
 *
 * Tiptap 기본 Highlight는 색을 style="background-color:…"로 싣는데,
 * 서버 소독기가 style 속성을 통째로 막는다(허용 목록을 좁게 두려는 선택).
 * 그래서 색을 data-color로만 싣고 실제 색은 globals.css가 입힌다.
 * 이렇게 해야 편집 중 화면과 저장 후 화면이 정확히 같아진다.
 */
export const HIGHLIGHT_COLORS = [
  { value: 'yellow', label: '노랑' },
  { value: 'blue', label: '파랑' },
  { value: 'green', label: '초록' },
  { value: 'pink', label: '분홍' },
] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]['value'];

const DataColorHighlight = Highlight.extend({
  renderHTML({ HTMLAttributes }) {
    const color = HTMLAttributes['data-color'] ?? HTMLAttributes.color;
    return ['mark', color ? { 'data-color': color } : {}, 0];
  },
});

export interface BuildExtensionsOptions {
  placeholder?: string;
}

/**
 * 에디터와 미리보기가 같은 확장 목록을 쓰도록 한곳에서 만든다.
 * 서버 소독기가 허용하는 태그와 짝이 맞아야 하므로 임의로 늘리지 말 것.
 */
export function buildExtensions({ placeholder }: BuildExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      // 본문 최상위 제목은 페이지의 h1(글 제목)이므로 본문은 h2부터 쓴다
      heading: { levels: [2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'nofollow noopener noreferrer', target: '_blank' },
      },
    }),
    DataColorHighlight.configure({ multicolor: true }),
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: 'blog-content-image' },
    }),
    Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요.' }),
  ];
}
