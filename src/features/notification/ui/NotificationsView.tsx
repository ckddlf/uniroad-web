'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, Trash2, X } from 'lucide-react';

import { notificationHref } from '@/entities/notification/link';
import type { NotificationType } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { NOTIFICATION_TYPE } from '@/shared/lib/constants';
import { formatRelative } from '@/shared/lib/date';
import {
  Badge,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  Modal,
  Pagination,
  Skeleton,
  Tabs,
  useToast,
} from '@/shared/ui';

import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useNotifications,
  useReadAllNotifications,
  useReadNotification,
  type NotificationScope,
} from '../api';

const TYPES: NotificationType[] = ['CHAT', 'MATCH', 'LIKE', 'NOTICE', 'SYSTEM'];

export function NotificationsView() {
  const router = useRouter();
  const toast = useToast();

  const [scope, setScope] = useState<NotificationScope>('all');
  const [page, setPage] = useState(0);
  const [typeFilters, setTypeFilters] = useState<NotificationType[]>([]);
  const [clearOpen, setClearOpen] = useState(false);

  const list = useNotifications(scope, page);
  const readOne = useReadNotification();
  const readAll = useReadAllNotifications();
  const deleteOne = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();

  // 타입 필터는 서버 파라미터가 없어 받아온 페이지 안에서만 걸러낸다
  const items = (list.data?.content ?? []).filter(
    (notification) => typeFilters.length === 0 || typeFilters.includes(notification.type),
  );

  const changeScope = (next: NotificationScope) => {
    setScope(next);
    setPage(0);
  };

  const toggleType = (type: NotificationType) => {
    setTypeFilters((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  };

  const open = (notificationId: number, href: string | null, read: boolean) => {
    if (!read) readOne.mutate(notificationId);
    if (href) router.push(href);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 text-ink-900">알림</h1>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            loading={readAll.isPending}
            onClick={() =>
              readAll.mutate(undefined, {
                onSuccess: () => toast.success('모두 읽음으로 표시했어요.'),
              })
            }
            leftIcon={<CheckCheck aria-hidden className="size-4" />}
          >
            전체 읽음
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setClearOpen(true)}
            leftIcon={<Trash2 aria-hidden className="size-4" />}
          >
            전체 삭제
          </Button>
        </div>
      </header>

      <Tabs
        aria-label="알림 구분"
        items={[
          { value: 'all', label: '전체' },
          { value: 'unread', label: '안 읽음' },
        ]}
        value={scope}
        onChange={(value) => changeScope(value as NotificationScope)}
      />

      <div className="flex flex-wrap gap-2">
        {TYPES.map((type) => (
          <Chip key={type} selected={typeFilters.includes(type)} onClick={() => toggleType(type)}>
            {NOTIFICATION_TYPE[type]}
          </Chip>
        ))}
      </div>

      {list.isPending && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      )}

      {list.isError && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}

      {list.isSuccess &&
        (items.length === 0 ? (
          <EmptyState
            title={scope === 'unread' ? '안 읽은 알림이 없어요' : '알림이 없어요'}
            description="새 채팅이나 공지가 오면 여기에 쌓여요."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100 border-y border-ink-100">
            {items.map((notification) => {
              const href = notificationHref(notification);

              return (
                <li key={notification.notificationId} className="flex items-start gap-3 py-4">
                  <button
                    type="button"
                    onClick={() => open(notification.notificationId, href, notification.read)}
                    className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Badge tone={notification.read ? 'neutral' : 'brand'}>
                        {NOTIFICATION_TYPE[notification.type]}
                      </Badge>
                      <span className="text-caption text-ink-500">
                        {formatRelative(notification.createdAt)}
                      </span>
                    </span>

                    <span
                      className={cn(
                        'text-body',
                        notification.read ? 'text-ink-500' : 'font-medium text-ink-900',
                      )}
                    >
                      {notification.title}
                    </span>
                    <span className="line-clamp-2-safe text-caption text-ink-500">
                      {notification.content}
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-label="알림 삭제"
                    onClick={() =>
                      deleteOne.mutate(notification.notificationId, {
                        onError: () => toast.error('삭제하지 못했어요.'),
                      })
                    }
                    className="rounded p-1.5 text-ink-500 transition-colors hover:bg-ink-100"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        ))}

      {list.isSuccess && list.data.totalPages > 1 && (
        <Pagination page={page} totalPages={list.data.totalPages} onChange={setPage} />
      )}

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="알림을 모두 삭제할까요?"
        description="삭제한 알림은 되돌릴 수 없어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              취소
            </Button>
            <Button
              variant="danger"
              loading={deleteAll.isPending}
              onClick={() =>
                deleteAll.mutate(undefined, {
                  onSuccess: () => {
                    setClearOpen(false);
                    setPage(0);
                    toast.success('알림을 모두 삭제했어요.');
                  },
                  onError: () => toast.error('삭제하지 못했어요.'),
                })
              }
            >
              전체 삭제
            </Button>
          </>
        }
      />
    </div>
  );
}
