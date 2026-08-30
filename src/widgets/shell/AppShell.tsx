import type { ReactNode } from 'react';

import { GlobalNav } from './GlobalNav';
import { MobileTabBar } from './MobileTabBar';
import { VerificationBanner } from './VerificationBanner';

/** 로그인 사용자 공통 셸 — GNB · 인증 유도 배너 · 모바일 하단 탭 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <GlobalNav />
      <VerificationBanner />

      {/* 모바일 하단 탭에 콘텐츠가 가리지 않도록 아래 여백을 둔다 */}
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8 pb-24 md:pb-8">
        {children}
      </main>

      <MobileTabBar />
    </div>
  );
}
