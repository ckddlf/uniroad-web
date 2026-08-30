'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PenLine, Search } from 'lucide-react';

import {
  COMMUNITY_TABS,
  defaultCommunityTab,
  isCommunityTab,
  type CommunityTab,
} from '@/entities/community/tab';
import { useAuthStore } from '@/shared/store/authStore';
import {
  Button,
  buttonClass,
  EmptyState,
  ErrorState,
  InfiniteScrollSentinel,
  Skeleton,
  Tabs,
} from '@/shared/ui';

import { useCommunityList } from '../api';
import { PopularPosts } from './PopularPosts';
import { PostCard } from './PostCard';

export function CommunityView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const situation = useAuthStore((state) => state.member?.currentSituation);

  const tabParam = searchParams.get('tab');
  const tab: CommunityTab = isCommunityTab(tabParam) ? tabParam : defaultCommunityTab(situation);
  const keyword = searchParams.get('q') ?? '';

  const [searchInput, setSearchInput] = useState(keyword);
  const list = useCommunityList(tab, keyword);

  /** 탭·검색어를 쿼리스트링에 반영해 뒤로가기와 링크 공유가 되게 한다 */
  const updateQuery = (next: { tab?: CommunityTab; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next.tab ?? tab);

    const nextKeyword = next.q ?? keyword;
    if (nextKeyword.trim() === '') params.delete('q');
    else params.set('q', nextKeyword.trim());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 text-ink-900">커뮤니티</h1>

        <Link href="/community/write" className={buttonClass({ className: 'hidden gap-1.5 sm:inline-flex' })}>
          <PenLine aria-hidden className="size-4" />
          글쓰기
        </Link>
      </header>

      <PopularPosts />

      <div className="flex flex-col gap-4">
        <Tabs
          aria-label="게시판 구분"
          items={COMMUNITY_TABS.map((item) => ({ value: item.value, label: item.label }))}
          value={tab}
          onChange={(value) => updateQuery({ tab: value })}
        />

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            updateQuery({ q: searchInput });
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-500"
            />
            <input
              type="search"
              aria-label="게시글 검색"
              placeholder="제목이나 내용으로 검색"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="h-10 w-full rounded-md border border-ink-300 bg-surface pr-3 pl-9 text-body placeholder:text-ink-300 hover:border-ink-500 focus:border-brand-500"
            />
          </div>
          <Button type="submit" variant="secondary">
            검색
          </Button>
        </form>
      </div>

      {keyword && (
        <p className="text-caption text-ink-500">
          &lsquo;{keyword}&rsquo; 검색 결과
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              updateQuery({ q: '' });
            }}
            className="ml-2 underline underline-offset-2"
          >
            검색 초기화
          </button>
        </p>
      )}

      {list.isPending && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      )}

      {list.isError && <ErrorState error={list.error} onRetry={list.refetch} />}

      {list.isEmpty && (
        <EmptyState
          title={keyword ? '검색 결과가 없어요' : '아직 글이 없어요'}
          description={
            keyword
              ? '다른 단어로 찾아보시겠어요?'
              : '첫 글을 남기면 다음 기수에게 남는 자료가 돼요.'
          }
          action={
            <Link
              href="/community/write"
              className={buttonClass()}
            >
              글쓰기
            </Link>
          }
        />
      )}

      {list.items.length > 0 && (
        <ul className="flex flex-col border-t border-ink-100">
          {list.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}

      <InfiniteScrollSentinel
        hasNext={list.hasNext}
        loading={list.isFetchingNext}
        onLoadMore={list.fetchNext}
      />

      {/* 모바일에서는 하단 탭 위에 떠 있는 글쓰기 버튼을 쓴다 */}
      <Link
        href="/community/write"
        aria-label="글쓰기"
        className="fixed right-5 bottom-20 z-20 inline-flex size-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-pop transition-colors hover:bg-brand-600 sm:hidden"
      >
        <PenLine aria-hidden className="size-5" />
      </Link>
    </div>
  );
}
