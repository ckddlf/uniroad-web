import type { Metadata } from 'next';

import { HomeDashboard } from '@/widgets/home/HomeDashboard';

export const metadata: Metadata = { title: '홈' };
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <HomeDashboard />;
}
