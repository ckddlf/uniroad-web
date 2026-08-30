import type { ReactNode } from 'react';

import { OnboardingGuard } from '@/features/auth/ui/OnboardingGuard';

/** 이탈이 가장 큰 구간이라 GNB 없이 전체 화면으로 둔다 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
