import { isOptimizableImage, optimizedImageUrl } from '@/shared/lib/image';

/** 본문 칸의 최대 폭(px) — 상세 페이지의 max-w-[760px]에서 sm:px-8 좌우 여백을 뺀 값 */
const CONTENT_MAX_WIDTH = 696;

/** srcset 후보. 기본 deviceSizes·imageSizes에 있는 값만 쓸 수 있다 */
const SRCSET_WIDTHS = [384, 640, 828, 1080, 1200];

/** srcset이 없는 브라우저가 받는 기본 크기 */
const FALLBACK_WIDTH = 828;

function decodeAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function encodeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * 본문 HTML의 사진을 화면 폭에 맞는 크기로 받게 고친다.
 *
 * 에디터가 올린 사진은 원본(가로 1600px 안팎) 그대로 박혀 있어, 모바일에서도 원본을 받는다.
 * next/image를 쓸 수 없는 HTML 문자열이라 srcset·sizes를 직접 단다.
 * 첫 사진을 뺀 나머지는 화면에 가까워질 때 받도록 lazy를 붙인다.
 *
 * 입력은 서버(Jsoup)가 소독한 HTML이다(BlogArticle 참고). 여기서는 img 태그의 속성만 고친다.
 */
export function optimizeContentImages(html: string): string {
  let index = 0;

  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const isFirst = index === 0;
    index += 1;

    let result = tag;
    const srcAttr = tag.match(/\ssrc="([^"]*)"/);
    const src = srcAttr ? decodeAttr(srcAttr[1]) : null;

    if (srcAttr && isOptimizableImage(src) && !/\ssrcset=/.test(tag)) {
      // 에디터에서 폭을 줄인 사진은 style="width: 47%"처럼 비율이 붙는다
      const percent = Number(tag.match(/style="[^"]*\bwidth:\s*([\d.]+)%/)?.[1] ?? 100);
      const ratio = Math.min(Math.max(percent, 1), 100) / 100;
      const sizes = `(min-width: 760px) ${Math.round(CONTENT_MAX_WIDTH * ratio)}px, ${Math.round(ratio * 100)}vw`;
      const srcset = SRCSET_WIDTHS.map((w) => `${optimizedImageUrl(src, w)} ${w}w`).join(', ');

      result = result.replace(
        srcAttr[0],
        ` src="${encodeAttr(optimizedImageUrl(src, FALLBACK_WIDTH))}" srcset="${encodeAttr(srcset)}" sizes="${sizes}"`,
      );
    }

    if (!isFirst && !/\sloading=/.test(result)) {
      result = result.replace(/^<img\b/, '<img loading="lazy" decoding="async"');
    }

    return result;
  });
}
