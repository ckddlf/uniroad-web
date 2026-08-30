import type { Metadata } from 'next';

import { NotificationsView } from '@/features/notification/ui/NotificationsView';

export const metadata: Metadata = { title: '알림' };
export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <NotificationsView />
    </div>
  );
}
