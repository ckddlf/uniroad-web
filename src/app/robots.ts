import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/shared/lib/site';

/**
 * 로그인해야 열리는 화면은 크롤러에게 빈 껍데기로만 보인다.
 * 색인돼 봐야 검색 결과에 내용 없는 페이지가 쌓일 뿐이라 통째로 막는다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/my',
        '/chat',
        '/onboarding',
        '/notifications',
        '/verification',
        '/account-book',
        '/ui-kit',
        // API 중계 경로. 크롤러가 JSON을 긁어갈 이유가 없다.
        '/backend/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
