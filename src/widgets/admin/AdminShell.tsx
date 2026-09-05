'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BadgeCheck, LayoutDashboard, Megaphone, PenLine, Siren, Users } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

const MENU = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/members', label: '회원 관리', icon: Users },
  { href: '/admin/verifications', label: '인증 심사', icon: BadgeCheck },
  { href: '/admin/reports', label: '신고 관리', icon: Siren },
  { href: '/admin/notices', label: '공지 관리', icon: Megaphone },
  { href: '/admin/blog', label: '블로그', icon: PenLine },
];

/** 일반 GNB 대신 쓰는 관리자 전용 셸 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="hidden w-56 shrink-0 flex-col bg-ink-900 p-4 md:flex">
        <Link href="/home" className="mb-6 px-2 text-h2 font-bold tracking-tight text-white">
          UNIROAD
          <span className="ml-2 text-caption font-normal text-ink-300">운영</span>
        </Link>

        <nav aria-label="관리자 메뉴" className="flex flex-col gap-1">
          {MENU.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-body transition-colors',
                  active ? 'bg-white/10 font-medium text-white' : 'text-ink-300 hover:bg-white/5',
                )}
              >
                <Icon aria-hidden className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/home"
          className="mt-auto rounded-md px-3 py-2 text-caption text-ink-300 hover:bg-white/5"
        >
          ← 서비스로 돌아가기
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <nav
          aria-label="관리자 메뉴"
          className="flex gap-1 overflow-x-auto border-b border-ink-100 bg-ink-900 px-4 py-2 md:hidden"
        >
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 text-caption',
                pathname === item.href ? 'bg-white/10 text-white' : 'text-ink-300',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
