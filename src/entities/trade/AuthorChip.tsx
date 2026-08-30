import { cn } from '@/shared/lib/cn';
import { displayName } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui';

/** 중고거래·티켓 양도 DTO가 공통으로 담고 있는 작성자 정보 */
export interface TradeAuthor {
  authorName: string;
  authorNickname: string | null;
  authorDispatchedCountry: string | null;
  authorDispatchedRegion: string | null;
  authorDispatchedUniversity: string | null;
  authorDispatchYear: number | null;
  authorDispatchSemester: string | null;
}

export interface AuthorChipProps {
  author: TradeAuthor;
  /** 아바타를 함께 보여줄지 */
  withAvatar?: boolean;
  className?: string;
}

/** "유니 · 프랑스 파리 · 소르본 대학교 · 25년 2학기" */
export function formatAuthorContext(author: TradeAuthor): string[] {
  const place = [author.authorDispatchedCountry, author.authorDispatchedRegion]
    .filter(Boolean)
    .join(' ');

  const term =
    author.authorDispatchYear && author.authorDispatchSemester
      ? `${String(author.authorDispatchYear).slice(2)}년 ${author.authorDispatchSemester}`
      : null;

  return [place || null, author.authorDispatchedUniversity, term].filter(
    (value): value is string => Boolean(value),
  );
}

/**
 * 같은 지역 사용자인지 한눈에 알아보게 하는 것이 거래 성사의 핵심이라
 * 목록·상세 어디서나 작성자의 파견 정보를 함께 보여준다.
 */
export function AuthorChip({ author, withAvatar = false, className }: AuthorChipProps) {
  const name = displayName(author.authorNickname, author.authorName);
  const context = formatAuthorContext(author);

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5 text-caption text-ink-500', className)}>
      {withAvatar && <Avatar name={name} size="sm" />}

      {/* TODO(api): 거래 DTO에 작성자 role이 없어 인증 뱃지를 표시할 수 없다 */}
      <span className="font-medium text-ink-700">{name}</span>

      {context.length > 0 && (
        <span className="truncate">
          {context.map((part) => (
            <span key={part}>
              <span aria-hidden className="mx-1 text-ink-300">
                ·
              </span>
              {part}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
