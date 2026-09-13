/**
 * 사이트의 공개 주소. canonical·OG 이미지·sitemap이 절대 URL을 만들 때 쓴다.
 *
 * Next는 metadataBase 없이는 상대 경로를 절대 URL로 올려주지 못한다.
 * 그러면 og:image가 `/logo.png` 그대로 나가 카카오톡·슬랙에서 썸네일이 비어 보인다.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uniroad.kr').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'UNIROAD';

/** sitemap처럼 문자열로 URL을 만들어야 하는 곳에서 쓴다 */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
