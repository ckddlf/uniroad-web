import type { Metadata } from 'next';

import { ScheduleView } from '@/features/schedule/ui/ScheduleView';

export const metadata: Metadata = { title: '스케줄' };
export const dynamic = 'force-dynamic';

export default function SchedulePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-h1 text-ink-900">스케줄</h1>
        <p className="mt-1 text-body text-ink-500">
          국제처 일정과 제출 서류를 한 화면에서 관리하세요.
        </p>
      </header>

      <ScheduleView />
    </div>
  );
}
