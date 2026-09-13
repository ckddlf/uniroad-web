import { SITE_NAME, SITE_URL, absoluteUrl } from './site';

/** 검색엔진이 사이트 주인을 식별하는 정보. 로고와 이름이 검색결과에 함께 뜬다. */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo-uniroad.png'),
    description:
      '파견 준비 일정, 제출 서류 체크리스트, 현지 중고거래와 동행 구하기까지. 교환학생에게 필요한 것만 모은 커뮤니티.',
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'ko-KR',
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  slug: string;
  imageUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  updatedAt: string;
  tags: string[];
}

/**
 * 글 하나를 기사로 알린다.
 * dateModified가 있어야 글을 고쳤을 때 재색인이 빨라진다.
 */
export function articleSchema(post: ArticleSchemaInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/blog/${post.slug}`) },
    image: post.imageUrl ?? absoluteUrl('/logo-uniroad.png'),
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    inLanguage: 'ko-KR',
    author: { '@type': post.authorName ? 'Person' : 'Organization', name: post.authorName ?? SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo-uniroad.png') },
    },
  };
}

/** 검색결과에서 질문이 접혔다 펴지는 형태로 뜬다 */
export function faqSchema(items: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** 검색결과 제목 위에 "홈 › 블로그 › 글" 경로를 띄운다 */
export function breadcrumbSchema(trail: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
