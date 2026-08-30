'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

import { notificationHref } from '@/entities/notification/link';
import { useNotifications, useReadNotification, useUnreadCount } from '@/features/notification/api';
import { formatRelative } from '@/shared/lib/date';
import { NOTIFICATION_TYPE } from '@/shared/lib/constants';
import { Badge, Dropdown, Skeleton } from '@/shared/ui';

/** 헤더 벨 — 60초마다 안 읽은 개수를 확인하고, 열면 최근 5건을 보여준다 */
export function NotificationBell() {
  const router = useRouter();
  const unreadCount = useUnreadCount();
  const preview = useNotifications('unread', 0, 5);
  const readNotification = useReadNotification();

  const count = unreadCount.data?.count ?? 0;

  const open = (notificationId: number, href: string | null) => {
    readNotification.mutate(notificationId);
    if (href) router.push(href);
  };

  return (
    <Dropdown
      label={count > 0 ? `알림 ${count}건` : '알림'}
      menuClassName="w-80"
      trigger={
        <span className="relative inline-flex size-10 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100">
          <Bell aria-hidden className="size-5" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-4 font-medium text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
      }
    >
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-label font-medium text-ink-700">안 읽은 알림</span>
        <Link href="/notifications" className="text-caption text-brand-600 hover:underline">
          전체 보기
        </Link>
      </div>

      <div className="max-h-80 overflow-y-auto border-t border-ink-100">
        {preview.isPending && <Skeleton className="m-3 h-16" />}

        {preview.isError && (
          <p className="px-4 py-6 text-center text-caption text-ink-500">
            알림을 불러오지 못했어요.
          </p>
        )}

        {preview.isSuccess &&
          (preview.data.content.length === 0 ? (
            <p className="px-4 py-8 text-center text-caption text-ink-500">
              새로운 알림이 없어요.
            </p>
          ) : (
            <ul>
              {preview.data.content.map((notification) => (
                <li key={notification.notificationId}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => open(notification.notificationId, notificationHref(notification))}
                    className="flex w-full flex-col gap-1 border-b border-ink-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-ink-100/60"
                  >
                    <span className="flex items-center gap-2">
                      <Badge tone="brand">{NOTIFICATION_TYPE[notification.type]}</Badge>
                      <span className="truncate text-caption text-ink-500">
                        {formatRelative(notification.createdAt)}
                      </span>
                    </span>
                    <span className="line-clamp-2-safe text-body text-ink-900">
                      {notification.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </Dropdown>
  );
}
