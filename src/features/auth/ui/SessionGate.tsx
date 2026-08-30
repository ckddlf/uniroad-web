'use client';

import { Loader2 } from 'lucide-react';

/** 세션 복원이 끝나기 전까지 보여주는 전체 화면 로딩 */
export function SessionGate() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <span className="flex items-center gap-2 text-body text-ink-500">
        <Loader2 aria-hidden className="size-5 animate-spin" />
        불러오는 중이에요
      </span>
    </div>
  );
}
