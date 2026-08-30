'use client';

import { useState } from 'react';

import { CompanionCard } from '@/features/companion/ui/CompanionCard';
import { PostCard } from '@/features/community/ui/PostCard';
import { TicketCard } from '@/features/ticket/ui/TicketCard';
import { UsedItemCard } from '@/features/market/ui/UsedItemCard';
import { useMyCommunityList } from '@/features/community/api';
import { useMyCompanionList } from '@/features/companion/api';
import { useMyMarketList } from '@/features/market/api';
import { useMyTicketList } from '@/features/ticket/api';
import { selectIsVerified, useAuthStore } from '@/shared/store/authStore';
import {
  EmptyState,
  ErrorState,
  InfiniteScrollSentinel,
  Skeleton,
  Tabs,
} from '@/shared/ui';

type Domain = 'community' | 'market' | 'ticket' | 'companion';

const TABS: { value: Domain; label: string }[] = [
  { value: 'community', label: '자유게시판' },
  { value: 'market', label: '중고거래' },
  { value: 'ticket', label: '티켓 양도' },
  { value: 'companion', label: '동행' },
];

export interface MyContentTabsProps {
  /** 내가 쓴 글인지 스크랩한 글인지 */
  scope: 'my' | 'scraps';
}

/**
 * 네 도메인 목록을 탭으로 묶는다.
 * 훅은 조건부로 호출할 수 없어 네 개를 모두 호출하되, 선택한 탭만 요청을 보낸다.
 */
export function MyContentTabs({ scope }: MyContentTabsProps) {
  const [tab, setTab] = useState<Domain>('community');
  const verified = useAuthStore(selectIsVerified);

  const community = useMyCommunityList(scope, tab === 'community');
  const market = useMyMarketList(scope, tab === 'market');
  const ticket = useMyTicketList(scope, tab === 'ticket');
  // 동행은 서버가 조회까지 인증 회원으로 제한한다
  const companion = useMyCompanionList(scope, tab === 'companion');

  const active = { community, market, ticket, companion }[tab];

  return (
    <div className="flex flex-col gap-5">
      <Tabs
        aria-label="글 종류"
        items={TABS.map((item) => ({ value: item.value, label: item.label }))}
        value={tab}
        onChange={(value) => setTab(value as Domain)}
      />

      {tab === 'companion' && !verified ? (
        <EmptyState
          title="교환학생 인증 후 볼 수 있어요"
          description="동행 글은 파견이 확인된 회원만 열람할 수 있어요."
        />
      ) : (
        <>
          {active.isPending && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          )}

          {active.isError && <ErrorState error={active.error} onRetry={active.refetch} />}

          {active.isEmpty && (
            <EmptyState
              title={scope === 'my' ? '아직 쓴 글이 없어요' : '스크랩한 글이 없어요'}
              description={
                scope === 'my'
                  ? '남겨주신 글이 다음 기수의 자료가 됩니다.'
                  : '마음에 드는 글을 스크랩해두면 여기 모여요.'
              }
            />
          )}

          {tab === 'community' && community.items.length > 0 && (
            <ul className="flex flex-col border-t border-ink-100">
              {community.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </ul>
          )}

          {tab === 'market' && market.items.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {market.items.map((item) => (
                <UsedItemCard key={item.id} item={item} />
              ))}
            </ul>
          )}

          {tab === 'ticket' && ticket.items.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {ticket.items.map((item) => (
                <TicketCard key={item.id} ticket={item} />
              ))}
            </ul>
          )}

          {tab === 'companion' && companion.items.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {companion.items.map((post) => (
                <CompanionCard key={post.id} post={post} />
              ))}
            </ul>
          )}

          <InfiniteScrollSentinel
            hasNext={active.hasNext}
            loading={active.isFetchingNext}
            onLoadMore={active.fetchNext}
          />
        </>
      )}
    </div>
  );
}
