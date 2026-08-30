'use client';

import { useState } from 'react';

import { toErrorMessage } from '@/shared/api/errors';
import type { FreePostCommentResponse } from '@/shared/api/types';
import { formatRelative } from '@/shared/lib/date';
import { Avatar, Button, Modal, Textarea, useToast } from '@/shared/ui';

import { useCreateComment, useDeleteComment, useUpdateComment } from '../api';

export interface CommentSectionProps {
  postId: number;
  comments: FreePostCommentResponse[];
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const toast = useToast();
  const createComment = useCreateComment(postId);
  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);

  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const submit = async () => {
    if (content.trim() === '') return;

    try {
      await createComment.mutateAsync({ content: content.trim() });
      setContent('');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const saveEdit = async () => {
    if (editingId === null || editingContent.trim() === '') return;

    try {
      await updateComment.mutateAsync({ commentId: editingId, content: editingContent.trim() });
      setEditingId(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;

    try {
      await deleteComment.mutateAsync(deletingId);
      setDeletingId(null);
      toast.success('댓글을 삭제했어요.');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
      <h2 id="comments-heading" className="text-h2 text-ink-900">
        댓글 {comments.length}
      </h2>

      <div className="flex flex-col gap-2">
        <Textarea
          aria-label="댓글 입력"
          placeholder="댓글을 남겨보세요."
          maxLength={500}
          showCount
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-24"
        />
        <div className="flex justify-end">
          <Button
            loading={createComment.isPending}
            disabled={content.trim() === ''}
            onClick={() => void submit()}
          >
            댓글 등록
          </Button>
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="py-8 text-center text-body text-ink-500">
          첫 댓글을 남겨보세요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 border-t border-ink-100">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3 py-4">
              <Avatar name={comment.authorName} size="sm" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-label font-medium text-ink-900">{comment.authorName}</span>
                  <span className="text-caption text-ink-500">
                    {formatRelative(comment.createdAt)}
                  </span>
                </div>

                {editingId === comment.id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <Textarea
                      aria-label="댓글 수정"
                      value={editingContent}
                      maxLength={500}
                      onChange={(event) => setEditingContent(event.target.value)}
                      className="min-h-20"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        취소
                      </Button>
                      <Button
                        size="sm"
                        loading={updateComment.isPending}
                        onClick={() => void saveEdit()}
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-body whitespace-pre-wrap text-ink-700">{comment.content}</p>
                )}

                {comment.mine && editingId !== comment.id && (
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditingContent(comment.content);
                      }}
                      className="text-caption text-ink-500 underline-offset-2 hover:underline"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(comment.id)}
                      className="text-caption text-danger underline-offset-2 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 되돌릴 수 없어요."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletingId(null)}>
              취소
            </Button>
            <Button variant="danger" loading={deleteComment.isPending} onClick={() => void confirmDelete()}>
              삭제
            </Button>
          </>
        }
      />
    </section>
  );
}
