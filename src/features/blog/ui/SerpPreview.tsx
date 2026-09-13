import { SITE_URL } from '@/shared/lib/site';

/** 구글이 검색결과에서 자르는 대략의 지점. 픽셀 기준이라 정확할 수는 없고 눈대중용이다. */
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

function truncate(text: string, limit: number): string {
  return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}

export interface SerpPreviewProps {
  title: string;
  description: string;
  slug: string;
}

/**
 * 검색결과에 어떻게 뜰지 보여준다.
 *
 * "60자"라는 숫자만으로는 작성자가 고치지 않는다. 잘린 모습을 봐야 고친다.
 */
export function SerpPreview({ title, description, slug }: SerpPreviewProps) {
  const host = SITE_URL.replace(/^https?:\/\//, '');
  const shown = title === '' ? '제목 없음' : truncate(`${title} | UNIROAD`, TITLE_LIMIT);

  return (
    <div className="rounded-md border border-ink-100 bg-canvas p-4">
      <p className="mb-2 text-caption text-ink-500">검색결과 미리보기</p>

      <div className="font-sans">
        <p className="truncate text-caption text-ink-700">
          {host} › blog › {slug === '' ? '자동 생성' : slug}
        </p>
        <p className="mt-0.5 text-body text-[#1a0dab] dark:text-[#8ab4f8]">{shown}</p>
        <p className="mt-0.5 text-caption text-ink-500">
          {description === '' ? '설명이 없습니다.' : truncate(description, DESCRIPTION_LIMIT)}
        </p>
      </div>
    </div>
  );
}
