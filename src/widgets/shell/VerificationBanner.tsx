'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

import { readJson, writeJson } from '@/shared/lib/storage';
import { useAuthStore } from '@/shared/store/authStore';

const DISMISS_KEY = 'uniroad.verificationBannerDismissed';

/** 인증 전 회원에게만 노출한다. 닫으면 이 세션 동안 다시 뜨지 않는다. */
export function VerificationBanner() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const [dismissed, setDismissed] = useState(true);

  // 세션 저장소는 마운트 후에 읽어야 서버 렌더 결과와 어긋나지 않는다
  useEffect(() => {
    setDismissed(readJson<boolean>(DISMISS_KEY, 'session') === true);
  }, []);

  if (role !== 'USER' || dismissed || pathname === '/verification') return null;

  return (
    <div className="border-b border-brand-100 bg-brand-50">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-6 py-2.5">
        <p className="flex-1 text-body text-brand-700">
          ⚠ 교환학생 인증을 완료하면 거래·동행 기능을 쓸 수 있어요
        </p>

        <Link
          href="/verification"
          className="shrink-0 rounded-md bg-brand-500 px-3 py-1.5 text-caption font-medium text-white transition-colors hover:bg-brand-600"
        >
          인증하기
        </Link>

        <button
          type="button"
          aria-label="배너 닫기"
          onClick={() => {
            writeJson(DISMISS_KEY, true, 'session');
            setDismissed(true);
          }}
          className="shrink-0 rounded p-1 text-brand-700 transition-colors hover:bg-brand-100"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
