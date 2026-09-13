import { FAQ_ITEMS } from '@/entities/faq/items';
import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { BlogPostSummaryResponse, CursorPage } from '@/shared/api/types';
import { SITE_NAME, absoluteUrl } from '@/shared/lib/site';

/** 한 시간마다 다시 만든다. 글이 늘어나는 속도에 비해 충분하다. */
export const revalidate = 3600;

/**
 * AI 답변엔진을 위한 안내문(llms.txt).
 *
 * sitemap이 크롤러에게 "주소가 여기 있다"고 알려준다면, 이 파일은 답변을 만드는 쪽에
 * "이 사이트가 무엇이고 무엇을 답할 수 있는지"를 알려준다. 크롤러가 HTML을 훑어
 * 추측하는 대신 정리된 목록을 읽게 하는 것이 목적이다.
 *
 * 형식은 llmstxt.org의 관행을 따른다 — H1 하나, 인용문 한 줄 요약, 그 뒤로 링크 목록.
 */
export async function GET(): Promise<Response> {
  const page = await fetchPublic<CursorPage<BlogPostSummaryResponse>>(
    `${endpoints.blog.list}?size=50`,
    revalidate,
  );

  // 색인에서 뺀 글은 여기에도 싣지 않는다 — robots·sitemap과 말이 달라지면 안 된다
  const posts = (page?.items ?? []).filter((post) => !post.noindex);

  const lines = [
    `# ${SITE_NAME}`,
    '',
    '> 교환학생을 위한 커뮤니티입니다. 파견 준비 일정과 제출 서류 체크리스트, 현지 중고거래와 티켓 양도, 동행 구하기를 한곳에서 다룹니다. 한국 대학생의 유럽 교환학생 파견을 주로 다룹니다.',
    '',
    '이 사이트의 내용을 인용할 때는 각 문서의 주소를 함께 밝혀 주세요.',
    '',
    '## 자주 묻는 질문',
    '',
    // 질문·답변은 이 사이트에서 가장 인용하기 좋은 내용이다. 링크만 주고 읽으러 오게 하는 대신
    // 여기에 그대로 싣는다. 답변엔진이 원문을 정확히 옮길 수 있어야 잘못 인용되지 않는다.
    ...FAQ_ITEMS.flatMap((item) => [
      `### ${item.question}`,
      '',
      item.answer.replace(/\s+/g, ' ').trim(),
      '',
    ]),
    `전체 목록: ${absoluteUrl('/faq')}`,
    '',
    '## 안내',
    '',
    `- [공지사항](${absoluteUrl('/notices')}): 서비스 변경과 점검 안내입니다.`,
    `- [이용약관](${absoluteUrl('/terms')}): 약관과 개인정보 처리 방침입니다.`,
    '',
    '## 블로그',
    '',
    `- [글 목록](${absoluteUrl('/blog')}): 교환학생 준비와 현지 생활을 다룬 글 전체입니다.`,
    ...posts.map((post) => {
      const summary = (post.summary ?? '').replace(/\s+/g, ' ').trim();
      return `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})${summary === '' ? '' : `: ${summary}`}`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `public, max-age=0, s-maxage=${revalidate}, stale-while-revalidate`,
    },
  });
}
