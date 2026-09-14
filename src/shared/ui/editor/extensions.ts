import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { CharacterCount } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { ReactNodeViewRenderer, type Extensions } from '@tiptap/react';

import { ResizableImage } from './ResizableImage';

/**
 * 예전 글이 쓰던 형광펜 이름.
 *
 * 그때는 색을 이름(yellow·blue…)으로만 싣고 실제 색은 globals.css가 입혔다.
 * 서버 소독기가 style 속성을 통째로 막던 시절의 방식이라, 지금도 그 글들이 그대로 보이도록
 * 이름은 계속 지원한다. 새로 고르는 색은 아래 renderHTML이 값을 그대로 싣는다.
 */
const PRESET_HIGHLIGHTS: readonly string[] = ['yellow', 'blue', 'green', 'pink'];

/** 색을 직접 고르는 칸에 미리 깔아 두는 값 — 자주 쓰는 색을 매번 고르지 않게 한다 */
export const HIGHLIGHT_SWATCHES = [
  '#fff3a3',
  '#ffd6a3',
  '#ffd6e5',
  '#e7d6ff',
  '#cfe3ff',
  '#cdf0d8',
  '#d9f2f0',
  '#e6e9ed',
] as const;

export const TEXT_COLOR_SWATCHES = [
  '#16181a',
  '#3a4046',
  '#6b7682',
  '#d12b2b',
  '#e07b00',
  '#1f9d55',
  '#1f4f9e',
  '#7b2ff2',
] as const;

/** 글씨 크기 단계. 본문 기본값은 17px(=1.0625rem)이라 그 값을 "기본"으로 둔다. */
export const FONT_SIZES = [
  { value: '', label: '기본' },
  { value: '13px', label: '아주 작게' },
  { value: '15px', label: '작게' },
  { value: '17px', label: '보통' },
  { value: '20px', label: '크게' },
  { value: '24px', label: '아주 크게' },
  { value: '30px', label: '제목처럼' },
  { value: '40px', label: '표지처럼' },
] as const;

/** 이미지 크기 단계. 끄는 게 번거로울 때 한 번에 맞추는 용도다. */
export const IMAGE_WIDTHS = [
  { value: '25%', label: '작게' },
  { value: '50%', label: '보통' },
  { value: '75%', label: '크게' },
  { value: '100%', label: '꽉 차게' },
] as const;

/**
 * 본문 이미지.
 *
 * width/height: 원본 픽셀 크기. 기본 Image 확장은 이 둘을 들고 있지 않아 저장할 때 떨어져
 * 나가는데, 값이 없으면 브라우저가 이미지 자리를 미리 잡지 못해 로딩 중에 글이 밀린다(CLS).
 *
 * displayWidth: 화면에 그릴 폭(본문 폭 대비 %). 원본 크기와 따로 두어야 자리 계산은
 * 원본 비율로 하면서 보이는 크기만 바꿀 수 있다. style로 싣고, 서버 소독기는 style 안에서
 * width 선언만 남긴다.
 */
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      displayWidth: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.width || null,
        renderHTML: (attributes: Record<string, unknown>) => {
          const width = attributes.displayWidth;
          if (typeof width !== 'string' || width === '') return {};
          return { style: `width: ${width}` };
        },
      },
    };
  },

  // 끌어서 크기를 조절하려면 이미지 옆에 손잡이를 그려야 한다 — 기본 렌더링에는 그럴 자리가 없다
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

const ColoredHighlight = Highlight.extend({
  renderHTML({ HTMLAttributes }) {
    const color = (HTMLAttributes['data-color'] ?? HTMLAttributes.color) as string | undefined;
    if (!color) return ['mark', {}, 0];

    // 프리셋은 이름만 싣는다(색은 CSS 담당). 직접 고른 색은 값이 그대로 있어야 재현된다.
    if (PRESET_HIGHLIGHTS.includes(color)) {
      return ['mark', { 'data-color': color }, 0];
    }
    return ['mark', { 'data-color': color, style: `background-color: ${color}` }, 0];
  },
});

/**
 * 표 칸에 배경색을 넣을 수 있게 속성을 하나 더한다.
 * Tiptap 기본 TableCell에는 색 개념이 없어서, 칸을 강조하려면 이 속성이 필요하다.
 */
function withBackgroundColor<T extends typeof TableCell | typeof TableHeader>(cell: T) {
  return cell.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
          renderHTML: (attributes: Record<string, unknown>) => {
            const color = attributes.backgroundColor;
            if (typeof color !== 'string' || color === '') return {};
            return { style: `background-color: ${color}` };
          },
        },
      };
    },
  });
}

/** 표 테두리 모양. 값은 data-border로 실리고 실제 선은 globals.css가 긋는다. */
export const TABLE_BORDERS = [
  { value: 'all', label: '전체 테두리' },
  { value: 'horizontal', label: '가로선만' },
  { value: 'none', label: '테두리 없음' },
] as const;

export type TableBorder = (typeof TABLE_BORDERS)[number]['value'];

/**
 * 표마다 테두리 모양을 고를 수 있게 속성을 하나 더한다.
 * style이 아니라 data-border로 싣는 이유는 소독기를 넓히지 않고도 값이 살아남기 때문이다.
 */
const BorderedTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderStyle: {
        default: 'all',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-border') ?? 'all',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-border': typeof attributes.borderStyle === 'string' ? attributes.borderStyle : 'all',
        }),
      },
    };
  },
});

export interface BuildExtensionsOptions {
  placeholder?: string;
}

/**
 * 에디터와 미리보기가 같은 확장 목록을 쓰도록 한곳에서 만든다.
 * 서버 소독기(BlogContentSanitizer)가 허용하는 태그·속성과 짝이 맞아야 하므로,
 * 여기에 무언가를 더하면 소독기 쪽도 같이 열어야 한다.
 */
export function buildExtensions({ placeholder }: BuildExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      // 본문 최상위 제목은 페이지의 h1(글 제목)이므로 본문은 h2부터 쓴다
      heading: { levels: [2, 3, 4] },
      // rel·target은 서버가 붙인다. 내부 링크인지 외부 링크인지는 도메인을 아는 쪽이 판단해야 한다.
      link: { openOnClick: false, autolink: true },
    }),
    TextStyle,
    FontSize,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ColoredHighlight.configure({ multicolor: true }),
    // resizable을 켜면 열 경계를 끌어 폭을 조절할 수 있고, 그 폭이 colgroup으로 저장된다
    BorderedTable.configure({ resizable: true, allowTableNodeSelection: true }),
    TableRow,
    withBackgroundColor(TableHeader),
    withBackgroundColor(TableCell),
    SizedImage.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: 'blog-content-image' },
    }),
    Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요.' }),
    CharacterCount,
  ];
}
