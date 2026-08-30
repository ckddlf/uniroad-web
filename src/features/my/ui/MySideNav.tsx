'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/cn';

const SECTIONS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: '프로필',
    items: [
      { href: '/my', label: '내 정보' },
      { href: '/my/profile', label: '프로필 수정' },
      { href: '/my/password', label: '비밀번호 변경' },
      { href: '/verification', label: '교환학생 인증' },
    ],
  },
  {
    title: '내 활동',
    items: [
      { href: '/my/posts', label: '내가 쓴 글' },
      { href: '/my/scraps', label: '스크랩' },
      { href: '/my/likes', label: '좋아요한 글' },
    ],
  },
  {
    title: '설정',
    items: [{ href: '/my/withdraw', label: '회원 탈퇴' }],
  },
];

export function MySideNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="마이페이지 메뉴" className="flex flex-col gap-6">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-label font-medium text-ink-500">{section.title}</p>

          <ul className="flex flex-col">
            {section.items.map((item) => {
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-2 text-body transition-colors',
                      active
                        ? 'bg-brand-50 font-medium text-brand-700'
                        : 'text-ink-700 hover:bg-ink-100',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
