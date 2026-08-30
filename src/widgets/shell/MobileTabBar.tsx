'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, ShoppingBag, User, Users } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

const TABS = [
  { href: '/home', label: '홈', icon: Home },
  { href: '/community', label: '커뮤니티', icon: Users },
  { href: '/market', label: '거래', icon: ShoppingBag },
  { href: '/chat', label: '채팅', icon: MessageSquare },
  { href: '/my', label: '마이', icon: User },
];

/** 768px 미만에서만 노출되는 하단 탭 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-surface md:hidden"
    >
      <ul className="flex">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-caption transition-colors',
                  active ? 'font-medium text-brand-600' : 'text-ink-500',
                )}
              >
                <Icon aria-hidden className="size-5" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
