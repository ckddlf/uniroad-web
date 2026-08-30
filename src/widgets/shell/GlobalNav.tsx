'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookmarkCheck,
  ChevronDown,
  LogOut,
  Shield,
  User,
  Wallet,
} from 'lucide-react';

import { useLogout } from '@/features/auth/model/useAuthActions';
import { cn } from '@/shared/lib/cn';
import { displayName } from '@/shared/lib/format';
import { selectIsAdmin, useAuthStore } from '@/shared/store/authStore';
import { Avatar, Dropdown, DropdownDivider, DropdownItem } from '@/shared/ui';

import { NotificationBell } from './NotificationBell';

const TRADE_MENU = [
  { href: '/market', label: '중고거래' },
  { href: '/tickets', label: '티켓 양도' },
  { href: '/companions', label: '동행 구하기' },
];


export function GlobalNav() {
  const pathname = usePathname();
  const member = useAuthStore((state) => state.member);
  const isAdmin = useAuthStore(selectIsAdmin);
  const logout = useLogout();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const tradeActive = TRADE_MENU.some((item) => isActive(item.href));

  const linkClass = (active: boolean) =>
    cn(
      'inline-flex h-9 items-center rounded-md px-3 text-body transition-colors',
      active ? 'font-medium text-brand-700' : 'text-ink-700 hover:bg-ink-100',
    );

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-ink-100 bg-surface">
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-6 px-6">
        <Link href="/home" className="text-h2 font-bold tracking-tight text-brand-600">
          UNIROAD
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
          <Link href="/home" className={linkClass(isActive('/home'))}>
            홈
          </Link>
          <Link href="/community" className={linkClass(isActive('/community'))}>
            커뮤니티
          </Link>

          <Dropdown
            align="start"
            label="거래·모임 메뉴"
            trigger={
              <span className={linkClass(tradeActive)}>
                거래·모임
                <ChevronDown aria-hidden className="ml-1 size-4" />
              </span>
            }
          >
            {TRADE_MENU.map((item) => (
              <DropdownItem key={item.href} href={item.href}>
                {item.label}
              </DropdownItem>
            ))}
          </Dropdown>

          <Link href="/schedule" className={linkClass(isActive('/schedule'))}>
            스케줄
          </Link>
          <Link href="/chat" className={linkClass(isActive('/chat'))}>
            채팅
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />

          <Dropdown
            label="프로필 메뉴"
            trigger={
              <span className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-ink-100">
                <Avatar name={displayName(member?.nickname, member?.name)} size="sm" />
                <ChevronDown aria-hidden className="size-4 text-ink-500" />
              </span>
            }
          >
            <DropdownItem href="/my" icon={<User aria-hidden className="size-4" />}>
              마이페이지
            </DropdownItem>
            <DropdownItem href="/account-book" icon={<Wallet aria-hidden className="size-4" />}>
              가계부
            </DropdownItem>
            <DropdownItem href="/my/scraps" icon={<BookmarkCheck aria-hidden className="size-4" />}>
              내 스크랩
            </DropdownItem>
            <DropdownItem href="/verification" icon={<Shield aria-hidden className="size-4" />}>
              교환학생 인증
            </DropdownItem>

            {isAdmin && (
              <>
                <DropdownDivider />
                <DropdownItem href="/admin" icon={<Shield aria-hidden className="size-4" />}>
                  관리자 콘솔
                </DropdownItem>
              </>
            )}

            <DropdownDivider />
            <DropdownItem
              tone="danger"
              icon={<LogOut aria-hidden className="size-4" />}
              onClick={() => void logout()}
            >
              로그아웃
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

