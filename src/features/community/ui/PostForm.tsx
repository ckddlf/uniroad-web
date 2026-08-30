'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { toErrorMessage } from '@/shared/api/errors';
import { useS3Upload } from '@/shared/hooks/useS3Upload';
import { applyServerFieldErrors } from '@/shared/lib/form';
import { readJson, removeKey, writeJson } from '@/shared/lib/storage';
import { Button, ImageUploader, Input, Textarea, useToast } from '@/shared/ui';

import { useCreatePost, useUpdatePost } from '../api';

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하로 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
});

type PostFormValues = z.infer<typeof postSchema>;

const DRAFT_KEY = 'uniroad.communityDraft';
const AUTOSAVE_INTERVAL = 30_000;

interface Draft extends PostFormValues {
  imageUrls: string[];
  savedAt: string;
}

export interface PostFormProps {
  /** 수정일 때만 전달 */
  postId?: number;
  initial?: { title: string; content: string; imageUrls: string[] };
}

export function PostForm({ postId, initial }: PostFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = postId !== undefined;

  const createPost = useCreatePost();
  const updatePost = useUpdatePost(postId ?? 0);
  const { uploadFiles, uploading, progress } = useS3Upload('public');

  const [imageUrls, setImageUrls] = useState<string[]>(initial?.imageUrls ?? []);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const submittedRef = useRef(false);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: initial?.title ?? '', content: initial?.content ?? '' },
  });

  // 새 글을 쓰던 중이었다면 복구할지 물어본다 (수정 화면에서는 원본이 우선이다)
  useEffect(() => {
    if (isEdit) return;
    const saved = readJson<Draft>(DRAFT_KEY);
    if (saved && (saved.title || saved.content)) setDraft(saved);
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) return;

    const timer = window.setInterval(() => {
      const values = getValues();
      if (values.title === '' && values.content === '' && imageUrls.length === 0) return;

      const nextDraft: Draft = { ...values, imageUrls, savedAt: new Date().toISOString() };
      writeJson(DRAFT_KEY, nextDraft);
    }, AUTOSAVE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [getValues, imageUrls, isEdit]);

  // 작성 중 이탈하면 브라우저 기본 확인창을 띄운다
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (submittedRef.current || (!isDirty && imageUrls.length === (initial?.imageUrls.length ?? 0))) {
        return;
      }
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, imageUrls.length, initial?.imageUrls.length]);

  const handleUpload = async (files: File[]) => {
    setUploadError(undefined);
    try {
      const uploaded = await uploadFiles(files);
      const urls = uploaded
        .map((file) => file.fileUrl)
        .filter((url): url is string => url !== null);
      setImageUrls((current) => [...current, ...urls]);
    } catch (error) {
      const message = toErrorMessage(error);
      setUploadError(message);
      toast.error(message);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const body = { ...values, imageUrls };

    try {
      if (isEdit) {
        await updatePost.mutateAsync(body);
        submittedRef.current = true;
        toast.success('수정했어요.');
        router.replace(`/community/${postId}`);
        return;
      }

      const newPostId = await createPost.mutateAsync(body);
      submittedRef.current = true;
      removeKey(DRAFT_KEY);
      toast.success('글을 올렸어요.');
      router.replace(`/community/${newPostId}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError, ['title', 'content'])) return;
      toast.error(toErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {draft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink-300 bg-canvas px-4 py-3">
          <p className="text-body text-ink-700">작성하던 글이 있어요.</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                reset({ title: draft.title, content: draft.content });
                setImageUrls(draft.imageUrls);
                setDraft(null);
              }}
            >
              이어서 쓰기
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                removeKey(DRAFT_KEY);
                setDraft(null);
              }}
            >
              지우기
            </Button>
          </div>
        </div>
      )}

      <Input
        label="제목"
        required
        maxLength={100}
        placeholder="어떤 이야기인가요?"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="내용"
        required
        rows={14}
        placeholder="파견을 준비하며 알게 된 것, 현지에서 겪은 일을 나눠주세요."
        error={errors.content?.message}
        className="min-h-72"
        {...register('content')}
      />

      <ImageUploader
        label="이미지"
        value={imageUrls}
        max={10}
        uploading={uploading}
        progress={progress}
        error={uploadError}
        hint="첫 번째 이미지가 목록의 썸네일로 쓰여요. 순서를 바꿀 수 있어요."
        onSelect={(files) => void handleUpload(files)}
        onRemove={(index) => setImageUrls((current) => current.filter((_, i) => i !== index))}
        onReorder={(from, to) =>
          setImageUrls((current) => {
            const next = [...current];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
          })
        }
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={uploading}>
          {isEdit ? '수정 완료' : '올리기'}
        </Button>
      </div>
    </form>
  );
}
