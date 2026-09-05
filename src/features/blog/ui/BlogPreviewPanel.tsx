'use client';

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

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
  title: string;
  summary: string;
  thumbnailUrl: string;
  contentHtml: string;
  authorNickname: string | null;
  publishedAt: string | null;
  likeCount: number;
}

/**
 * 작성 화면 오른쪽 미리보기.
 *
 * 실제 목록과 상세가 쓰는 BlogCard·BlogArticle을 그대로 불러 쓴다.
 * 미리보기 전용 마크업을 따로 두면 화면이 갈라져 "미리보기와 실제가 다르다"가 생기기 때문이다.
 */
export function BlogPreviewPanel(props: BlogPreviewPanelProps) {
  const [tab, setTab] = useState<PreviewTab>('card');
  const [width, setWidth] = useState<PreviewWidth>('desktop');

  const widthClass = width === 'mobile' ? 'max-w-[380px]' : 'max-w-full';

  return (
    <div className="flex h-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs items={TABS} value={tab} onChange={setTab} variant="pill" aria-label="미리보기 종류" />

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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-ink-100 bg-canvas p-5 scrollbar-thin">
        <div className={cn('mx-auto transition-[max-width]', widthClass)}>
          {tab === 'card' ? (
            <>
              <p className="mb-3 text-caption text-ink-500">
                블로그 목록에 이렇게 실립니다.
              </p>
              {/* 실제 목록은 3열 그리드라, 카드 하나의 폭을 그와 비슷하게 잡아 보여준다 */}
              <div className="max-w-[380px]">
                <BlogCard
                  post={{
                    title: props.title,
                    summary: props.summary === '' ? null : props.summary,
                    thumbnailUrl: props.thumbnailUrl === '' ? null : props.thumbnailUrl,
                    authorNickname: props.authorNickname,
                    publishedAt: props.publishedAt,
                    likeCount: props.likeCount,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-surface p-6">
              <BlogArticle
                post={{
                  title: props.title,
                  contentHtml: props.contentHtml,
                  authorNickname: props.authorNickname,
                  publishedAt: props.publishedAt,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
