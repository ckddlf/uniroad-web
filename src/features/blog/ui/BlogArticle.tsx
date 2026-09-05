import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/date';

export interface BlogArticleData {
  title: string;
  contentHtml: string;
  authorNickname: string | null;
  publishedAt: string | null;
  createdAt?: string | null;
  viewCount?: number;
}

export interface BlogArticleProps {
  post: BlogArticleData;
  /** 제목 아래에 붙는 좋아요 버튼 등 */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * 글 본문 렌더러. 상세 페이지와 관리자 미리보기가 이걸 함께 쓴다.
 *
 * contentHtml은 서버(Jsoup)가 허용 태그만 남긴 결과다. 그래서 그대로 주입한다 —
 * 소독을 거치지 않은 HTML을 여기에 넣으면 안 된다.
 */
export function BlogArticle({ post, actions, className }: BlogArticleProps) {
  const date = post.publishedAt ?? post.createdAt ?? null;

  return (
    <article className={cn('break-keep', className)}>
      <header className="flex flex-col gap-4 border-b border-ink-100 pb-8">
        <h1 className="text-section text-ink-900 text-balance">
          {post.title === '' ? '제목 없음' : post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption text-ink-500">
          <span>{date === null ? '아직 공개 전' : formatDate(date, 'yyyy년 M월 d일')}</span>
          {post.authorNickname && <span>· {post.authorNickname}</span>}
          {typeof post.viewCount === 'number' && <span>· 조회 {post.viewCount}</span>}
        </div>

        {actions}
      </header>

      <div
        className="blog-content mt-8"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
