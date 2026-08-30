'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import type { NoticeResponse } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/date';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Skeleton,
  Textarea,
  useToast,
} from '@/shared/ui';

import { useAdminNotices, useNoticeMutations } from '../api';

export function AdminNotices() {
  const toast = useToast();
  const notices = useAdminNotices();
  const { create, update, remove } = useNoticeMutations();

  const [editing, setEditing] = useState<NoticeResponse | 'new' | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deleting, setDeleting] = useState<NoticeResponse | null>(null);

  const openEditor = (notice: NoticeResponse | 'new') => {
    setEditing(notice);
    setTitle(notice === 'new' ? '' : notice.title);
    setContent(notice === 'new' ? '' : notice.content);
  };

  const save = () => {
    if (title.trim() === '' || content.trim() === '') {
      toast.error('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const body = { title: title.trim(), content: content.trim() };
    const onSuccess = () => {
      setEditing(null);
      toast.success(editing === 'new' ? '공지를 등록했어요.' : '공지를 수정했어요.');
    };
    const onError = (error: unknown) => toast.error(toErrorMessage(error));

    if (editing === 'new') create.mutate(body, { onSuccess, onError });
    else if (editing) update.mutate({ noticeId: editing.id, ...body }, { onSuccess, onError });
  };

  if (notices.isPending) return <Skeleton className="h-96 w-full" />;
  if (notices.isError) {
    return <ErrorState error={notices.error} onRetry={() => void notices.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => openEditor('new')} leftIcon={<Plus aria-hidden className="size-4" />}>
          공지 작성
        </Button>
      </div>

      {notices.data.length === 0 ? (
        <EmptyState title="등록된 공지가 없어요" />
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 rounded-lg border border-ink-100 bg-surface">
          {notices.data.map((notice) => (
            <li key={notice.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink-900">{notice.title}</p>
                <p className="text-caption text-ink-500">{formatDateTime(notice.createdAt)}</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEditor(notice)}>
                  수정
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleting(notice)}>
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? '공지 작성' : '공지 수정'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              취소
            </Button>
            <Button loading={create.isPending || update.isPending} onClick={save}>
              저장
            </Button>
          </>
        }
      >
        <Input
          label="제목"
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Textarea
          containerClassName="mt-4"
          label="내용"
          required
          rows={12}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="공지를 삭제할까요?"
        description="삭제하면 되돌릴 수 없습니다."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={() => {
                if (!deleting) return;
                remove.mutate(deleting.id, {
                  onSuccess: () => {
                    setDeleting(null);
                    toast.success('공지를 삭제했어요.');
                  },
                  onError: (error) => toast.error(toErrorMessage(error)),
                });
              }}
            >
              삭제
            </Button>
          </>
        }
      />
    </div>
  );
}
