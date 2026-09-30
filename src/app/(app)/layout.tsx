import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthGuard } from '@/features/auth/ui/AuthGuard';
import { AppShell } from '@/widgets/shell/AppShell';

/**
 * 이 그룹은 전부 로그인해야 열린다. 크롤러에게는 가드가 도는 빈 화면만 보이므로 색인에서 뺀다.
 *
 * robots.txt로 막지 않는 이유: 막으면 크롤러가 이 noindex를 읽지 못해서,
 * 이미 색인된 주소가 있더라도 검색 결과에서 빠지지 않는다.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard require="ACTIVE">
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
