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

/**
 * 기본 Image 확장은 width/height를 들고 있지 않아 저장할 때 떨어져 나간다.
 * 이 두 값이 없으면 브라우저가 이미지 자리를 미리 잡지 못해 로딩 중에 글이 밀린다(CLS).
 * 서버 소독기도 두 속성을 허용하고 있으므로 끝까지 살아남는다.
 */
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
    };
  },
});

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
      // rel·target은 서버가 붙인다. 내부 링크인지 외부 링크인지는 도메인을 아는 쪽이 판단해야 한다.
      link: { openOnClick: false, autolink: true },
    }),
    DataColorHighlight.configure({ multicolor: true }),
    SizedImage.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: 'blog-content-image' },
    }),
    Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요.' }),
  ];
}
