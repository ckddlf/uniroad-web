import type { Metadata } from 'next';

/**
 * 사이트의 공개 주소. canonical·OG 이미지·sitemap이 절대 URL을 만들 때 쓴다.
 *
 * Next는 metadataBase 없이는 상대 경로를 절대 URL로 올려주지 못한다.
 * 그러면 og:image가 `/logo.png` 그대로 나가 카카오톡·슬랙에서 썸네일이 비어 보인다.
 *
 * www가 붙은 쪽이 실제로 서비스되는 주소다. apex(uniroad.kr)는 여기로 308을 보내기만 한다.
 * 기본값을 apex로 두면 환경 변수를 빠뜨린 배포에서 canonical이 "리다이렉트되는 주소"를
 * 원본이라고 선언하게 되고, sitemap의 모든 주소도 한 번씩 튕긴다.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.uniroad.kr').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'UNIROAD';

/** 한글 표기. 블로그 작성자 이름으로도 쓰며, 검색엔진이 두 이름을 같은 곳으로 묶게 구조화 데이터에 싣는다 */
export const SITE_NAME_KO = '유니로드';

/** 문의 메일. 푸터와 구조화 데이터가 같은 값을 쓴다 */
export const CONTACT_EMAIL = 'uniroad.official@gmail.com';

/** sitemap처럼 문자열로 URL을 만들어야 하는 곳에서 쓴다 */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** 루트 레이아웃이 깔아두는 값 — 페이지가 openGraph를 다시 쓸 때 같이 실어야 한다 */
export const OG_DEFAULTS = {
  siteName: SITE_NAME,
  locale: 'ko_KR',
} as const;

export interface ShareImage {
  url: string;
  width: number;
  height: number;
}

/**
 * app/opengraph-image.tsx가 만드는 기본 공유 이미지.
 *
 * Next가 루트 페이지에는 이 파일을 알아서 물려주지만, openGraph를 스스로 정의한 페이지에는
 * 물려주지 않는다(파일 기반 이미지는 그 파일이 놓인 세그먼트에서만 채워진다).
 * 그래서 그런 페이지에서는 주소를 직접 가리킨다. 실제 태그에는 캐시 무효화용 해시가 붙지만
 * 해시 없는 주소도 같은 이미지를 낸다.
 */
const DEFAULT_SHARE_IMAGE: ShareImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
};

/**
 * 공유 이미지 칸을 만든다.
 *
 * 페이지가 openGraph를 정의하면 루트의 것이 통째로 교체되므로, 이미지가 없는 글은
 * 여기서 기본 이미지를 채워 넣어야 공유 미리보기가 빈 카드로 뜨지 않는다.
 */
export function shareImages(url: string | null | undefined): { images: ShareImage[] } {
  if (url === null || url === undefined || url === '') {
    return { images: [DEFAULT_SHARE_IMAGE] };
  }
  return { images: [{ url, width: 1200, height: 630 }] };
}

/**
 * 고정된 공개 페이지 하나의 검색·공유 정보를 한 번에 만든다.
 *
 * openGraph를 정의하지 않은 페이지는 루트의 것(홈의 제목·설명·주소)을 그대로 물려받아,
 * 카카오톡·슬랙에 공유하면 어느 페이지든 홈처럼 보인다. 그래서 canonical과 함께 페이지마다 채운다.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OG_DEFAULTS,
      type: 'website',
      title,
      description,
      url: path,
      ...shareImages(null),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...shareImages(null),
    },
  };
}
