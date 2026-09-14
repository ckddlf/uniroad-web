'use client';

import type { ReactNode } from 'react';

import type { CurrentSituation } from '@/shared/api/types';
import { useAuthStore } from '@/shared/store/authStore';

import { AccountWidget } from './AccountWidget';
import { BlogWidget } from './BlogWidget';
import { CompanionWidget } from './CompanionWidget';
import { HomeGreeting } from './HomeGreeting';
import { MarketWidget } from './MarketWidget';
import { PopularPostsWidget } from './PopularPostsWidget';

// 준비 일정과 공지사항은 노출을 내렸다. ScheduleWidget·NoticeWidget 파일은 그대로 두었으니
// 다시 켤 때 import와 아래 목록에 'schedule'·'notice'만 되돌리면 된다.
type WidgetKey = 'popular' | 'market' | 'blog' | 'companion' | 'account';

/**
 * 같은 홈이지만 상황에 따라 순서를 바꾼다.
 * 지원 준비 중에는 커뮤니티와 동행이, 파견 중에는 생활비와 거래가 먼저 필요하다.
 */
const ORDER: Record<CurrentSituation, WidgetKey[]> = {
  PREPARING_APPLICATION: ['popular', 'companion', 'market', 'blog', 'account'],
  PREPARING_DEPARTURE: ['companion', 'market', 'blog', 'popular', 'account'],
  DISPATCHED: ['account', 'market', 'blog', 'companion', 'popular'],
};

const DEFAULT_ORDER: WidgetKey[] = ['popular', 'market', 'blog', 'companion', 'account'];

const WIDGETS: Record<WidgetKey, ReactNode> = {
  popular: <PopularPostsWidget />,
  market: <MarketWidget />,
  blog: <BlogWidget />,
  companion: <CompanionWidget />,
  account: <AccountWidget />,
};

/** 넓게 쓰는 편이 나은 위젯. 블로그는 카드가 커서 한 줄을 다 써야 제 모양이 나온다. */
const WIDE: WidgetKey[] = ['market', 'blog', 'account'];

export function HomeDashboard() {
  const situation = useAuthStore((state) => state.member?.currentSituation);
  const order = situation ? ORDER[situation] : DEFAULT_ORDER;

  return (
    <div className="flex flex-col gap-6">
      <HomeGreeting />

      {/* 위젯마다 자기 데이터를 따로 불러오므로 하나가 실패해도 나머지는 그대로 보인다 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {order.map((key) => (
          <div key={key} className={WIDE.includes(key) ? 'lg:col-span-2' : undefined}>
            {WIDGETS[key]}
          </div>
        ))}
      </div>
    </div>
  );
}
