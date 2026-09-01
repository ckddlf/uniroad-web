'use client';

import type { ReactNode } from 'react';

import type { CurrentSituation } from '@/shared/api/types';
import { useAuthStore } from '@/shared/store/authStore';

import { AccountWidget } from './AccountWidget';
import { CompanionWidget } from './CompanionWidget';
import { HomeGreeting } from './HomeGreeting';
import { MarketWidget } from './MarketWidget';
import { NoticeWidget } from './NoticeWidget';
import { PopularPostsWidget } from './PopularPostsWidget';

// 준비 일정은 노출을 잠시 내렸다. ScheduleWidget은 그대로 두었으니
// 다시 켤 때 import와 아래 목록에 'schedule'만 되돌리면 된다.
type WidgetKey = 'popular' | 'market' | 'companion' | 'account' | 'notice';

/**
 * 같은 홈이지만 상황에 따라 순서를 바꾼다.
 * 지원 준비 중에는 커뮤니티와 동행이, 파견 중에는 생활비와 거래가 먼저 필요하다.
 */
const ORDER: Record<CurrentSituation, WidgetKey[]> = {
  PREPARING_APPLICATION: ['popular', 'companion', 'market', 'account', 'notice'],
  PREPARING_DEPARTURE: ['companion', 'market', 'popular', 'account', 'notice'],
  DISPATCHED: ['account', 'market', 'companion', 'popular', 'notice'],
};

const DEFAULT_ORDER: WidgetKey[] = ['popular', 'market', 'companion', 'account', 'notice'];

const WIDGETS: Record<WidgetKey, ReactNode> = {
  popular: <PopularPostsWidget />,
  market: <MarketWidget />,
  companion: <CompanionWidget />,
  account: <AccountWidget />,
  notice: <NoticeWidget />,
};

/** 넓게 쓰는 편이 나은 위젯 */
const WIDE: WidgetKey[] = ['market', 'account'];

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
