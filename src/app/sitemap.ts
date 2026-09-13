import type { MetadataRoute } from 'next';

import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { BlogPostSummaryResponse, CursorPage, NoticeResponse } from '@/shared/api/types';
import { absoluteUrl } from '@/shared/lib/site';

/** 백엔드가 한 번에 내주는 최대치. 더 큰 size를 보내도 서버가 잘라낸다. */
const PAGE_SIZE = 50;
/** 커서를 따라가다 멈추지 못하는 상황을 막는 상한 (= 최대 2,500개) */
const MAX_PAGES = 50;

/** 공개된 글을 커서 끝까지 따라가며 모은다 */
async function loadAllPosts(): Promise<BlogPostSummaryResponse[]> {
  const posts: BlogPostSummaryResponse[] = [];
  let cursor: number | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const query: string =
      cursor === null ? `?size=${PAGE_SIZE}` : `?size=${PAGE_SIZE}&cursorId=${cursor}`;
    const result: CursorPage<BlogPostSummaryResponse> | null = await fetchPublic<
      CursorPage<BlogPostSummaryResponse>
    >(`${endpoints.blog.list}${query}`, 3600);

    if (result === null) break;
    posts.push(...result.items);
    if (!result.hasNext || result.nextCursorId === null) break;
    cursor = result.nextCursorId;
  }

  return posts;
}

/**
 * 크롤러에게 무엇이 있는지 알리는 목록.
 *
 * 블로그 목록은 첫 9개만 서버에서 그리고 나머지는 "더 보기"로 채우기 때문에,
 * 이 파일이 없으면 10번째부터의 글은 발견될 길이 없다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, notices] = await Promise.all([
    loadAllPosts(),
    fetchPublic<NoticeResponse[]>(endpoints.notice.list, 3600),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/faq'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/notices'), changeFrequency: 'weekly', priority: 0.5 },
    { url: absoluteUrl('/terms'), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/signup'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/login'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // 색인에서 뺀 글을 sitemap에 남겨두면 서치콘솔이 모순이라고 경고한다
  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => !post.noindex)
    .map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const noticeRoutes: MetadataRoute.Sitemap = (notices ?? []).map((notice) => ({
    url: absoluteUrl(`/notices/${notice.id}`),
    lastModified: new Date(notice.updatedAt),
    changeFrequency: 'yearly',
    priority: 0.4,
  }));

  return [...staticRoutes, ...postRoutes, ...noticeRoutes];
}
