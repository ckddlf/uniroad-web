'use client';

import { useEffect, useState } from 'react';
import { Monitor, Smartphone, X } from 'lucide-react';

import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';
import { cn } from '@/shared/lib/cn';
import { Tabs, type TabItem } from '@/shared/ui';

import { BlogArticle } from './BlogArticle';
import { BlogCard } from './BlogCard';

type PreviewTab = 'card' | 'article';
type PreviewWidth = 'desktop' | 'mobile';

const TABS: TabItem<PreviewTab>[] = [
  { value: 'card', label: '목록 카드' },
  { value: 'article', label: '글 본문' },
];

export interface BlogPreviewPanelProps {
  onClose: () => void;
  title: string;
  summary: string;
  thumbnailUrl: string;
  contentHtml: string;
  publishedAt: string | null;
  likeCount: number;
}

/**
 * 미리보기 전체화면.
 *
 * 실제 목록과 상세가 쓰는 BlogCard·BlogArticle을, 공개 페이지와 같은 폭·배경 위에 그대로 얹는다.
 * 미리보기 전용 마크업을 따로 두면 화면이 갈라져 "미리보기와 실제가 다르다"가 생기고,
 * 편집 화면 옆 좁은 칸에 끼워 넣으면 줄바꿈과 이미지 크기가 실제와 달라 보인다.
 *
 * 그래서 평소에는 띄우지 않는다. 볼 때만 화면 전체를 쓰고, 다시 누르거나 Esc로 닫는다.
 */
export function BlogPreviewPanel({ onClose, ...props }: BlogPreviewPanelProps) {
  const [tab, setTab] = useState<PreviewTab>('article');
  const [width, setWidth] = useState<PreviewWidth>('desktop');

  useBodyScrollLock(true);

  // Esc로도 닫는다 — 화면을 덮는 것을 치우는 가장 익숙한 방법이다
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const mobile = width === 'mobile';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="미리보기"
      className="fixed inset-0 z-50 flex min-w-0 flex-col gap-4 bg-canvas p-4 sm:p-6"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <Tabs items={TABS} value={tab} onChange={setTab} variant="pill" aria-label="미리보기 종류" />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-ink-300 bg-surface p-0.5">
            {(
              [
                { value: 'desktop' as const, icon: Monitor, label: '데스크톱 폭' },
                { value: 'mobile' as const, icon: Smartphone, label: '모바일 폭' },
              ]
            ).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={width === value}
                title={label}
                onClick={() => setWidth(value)}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded transition-colors',
                  width === value ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-ink-100',
                )}
              >
                <Icon aria-hidden className="size-4" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            title="미리보기 닫기 (Esc)"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-ink-300 bg-surface px-3 text-caption text-ink-700 transition-colors hover:bg-ink-100"
          >
            <X aria-hidden className="size-4" />
            닫기
          </button>
        </div>
      </div>

      {/* 공개 페이지와 같은 배경(본문은 흰 바탕, 목록은 회색 바탕) 위에 같은 폭으로 얹는다 */}
      <div
        className={cn(
          'min-h-0 flex-1 overflow-y-auto rounded-lg border border-ink-100 scrollbar-thin',
          tab === 'article' ? 'bg-surface' : 'bg-canvas',
        )}
      >
        {tab === 'card' ? (
          <div className={cn('mx-auto w-full px-6 py-10 sm:px-8', mobile && 'max-w-[420px]')}>
            <p className="mb-4 text-caption text-ink-500">블로그 목록에 이렇게 실립니다.</p>

            {/* 실제 목록의 폭(최대 1200px)과 같아야 카드 한 칸의 크기가 화면에서와 같다 */}

            {/* 실제 목록과 같은 그리드에 얹는다 — 한 칸의 폭이 화면에서와 같아진다 */}
            <div
              className={cn(
                'mx-auto grid max-w-[1200px] gap-6',
                !mobile && 'sm:grid-cols-2 lg:grid-cols-3',
              )}
            >
              <BlogCard
                post={{
                  title: props.title,
                  summary: props.summary === '' ? null : props.summary,
                  thumbnailUrl: props.thumbnailUrl === '' ? null : props.thumbnailUrl,
                  publishedAt: props.publishedAt,
                  likeCount: props.likeCount,
                }}
              />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              // 공개 상세 페이지와 같은 폭·여백
              'mx-auto w-full px-6 py-14 transition-[max-width] sm:px-8',
              mobile ? 'max-w-[420px]' : 'max-w-[760px]',
            )}
          >
            <BlogArticle
              post={{
                title: props.title,
                contentHtml: props.contentHtml,
                publishedAt: props.publishedAt,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
