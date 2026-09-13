import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/shared/lib/site';

/**
 * 로그인해야 열리는 화면은 크롤러에게 빈 껍데기로만 보인다.
 * 색인돼 봐야 검색 결과에 내용 없는 페이지가 쌓일 뿐이라 통째로 막는다.
 */
const PRIVATE_PATHS = [
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
];

/**
 * AI 답변엔진의 크롤러.
 *
 * `*` 규칙만 있어도 이들은 이미 허용된다. 그래도 따로 적어두는 이유는,
 * "허용이 의도인지 신경 쓰지 않은 결과인지"가 코드만 봐서는 구별되지 않기 때문이다.
 * 답변에 인용되려면 읽히는 쪽이 유리하다고 보고 공개 경로는 열어둔다.
 * 나중에 학습과 인용을 나누고 싶어지면 손댈 자리가 여기다.
 */
const AI_AGENTS = [
  'GPTBot', // OpenAI
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot', // Anthropic
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended', // Google AI 학습·AI Overviews
  'Applebot-Extended',
  'Bytespider',
  'CCBot', // Common Crawl
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE_PATHS })),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
