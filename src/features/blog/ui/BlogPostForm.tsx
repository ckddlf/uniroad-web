'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Trash2 } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import type { BlogContentJson, BlogPostDetailResponse } from '@/shared/api/types';
import { useS3Upload } from '@/shared/hooks/useS3Upload';
import { cn } from '@/shared/lib/cn';
import { Button, Field, Input, Textarea, Toggle, useToast } from '@/shared/ui';
import { RichTextEditor } from '@/shared/ui/editor/RichTextEditor';

import { useAdminBlogMutations } from '../api';
import { BlogPreviewPanel } from './BlogPreviewPanel';

const SUMMARY_LENGTH = 150;

export interface BlogPostFormProps {
  /** 수정일 때만 넘어온다 */
  post?: BlogPostDetailResponse;
}

/** 본문 HTML에서 이미지 주소를 뽑아 썸네일 후보로 쓴다 */
function imageUrlsIn(html: string): string[] {
  if (typeof window === 'undefined' || html === '') return [];
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const urls = Array.from(parsed.querySelectorAll('img[src]')).map((img) =>
    img.getAttribute('src') ?? '',
  );
  return Array.from(new Set(urls.filter((url) => url !== '')));
}

/** 태그를 걷어낸 본문 — 설명을 비웠을 때 서버가 만들 요약을 미리 보여준다 */
function plainTextIn(html: string): string {
  if (typeof window === 'undefined' || html === '') return '';
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return (parsed.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { create, update } = useAdminBlogMutations();
  const { uploadFiles, uploading } = useS3Upload('public');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [summary, setSummary] = useState(post?.summary ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnailUrl ?? '');
  const [contentHtml, setContentHtml] = useState(post?.contentHtml ?? '');
  const [contentJson, setContentJson] = useState<BlogContentJson>(
    post?.contentJson ?? { type: 'doc', content: [] },
  );
  const [published, setPublished] = useState(post?.status === 'PUBLISHED');

  const saving = create.isPending || update.isPending;
  const bodyImages = useMemo(() => imageUrlsIn(contentHtml), [contentHtml]);
  const plainText = useMemo(() => plainTextIn(contentHtml), [contentHtml]);

  /** 비워두면 서버가 채우는 값 — 미리보기에는 그 결과를 그대로 보여준다 */
  const effectiveSummary =
    summary.trim() !== ''
      ? summary.trim()
      : plainText.length <= SUMMARY_LENGTH
        ? plainText
        : `${plainText.slice(0, SUMMARY_LENGTH).trim()}…`;

  const effectiveThumbnail = thumbnailUrl !== '' ? thumbnailUrl : (bodyImages[0] ?? '');

  const uploadThumbnail = async (file: File) => {
    try {
      const [uploaded] = await uploadFiles([file]);
      if (uploaded?.fileUrl) setThumbnailUrl(uploaded.fileUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이미지를 올리지 못했어요.');
    }
  };

  const save = () => {
    if (title.trim() === '') {
      toast.error('제목을 입력해주세요.');
      return;
    }
    if (plainText === '' && bodyImages.length === 0) {
      toast.error('본문을 입력해주세요.');
      return;
    }

    const body = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      contentJson,
      contentHtml,
      published,
    };

    const onError = (error: unknown) => toast.error(toErrorMessage(error));

    if (post) {
      update.mutate(
        { postId: post.id, ...body },
        {
          onSuccess: () => {
            toast.success('글을 수정했어요.');
            router.push('/admin/blog');
          },
          onError,
        },
      );
      return;
    }

    create.mutate(body, {
      onSuccess: () => {
        toast.success(published ? '글을 공개했어요.' : '초안으로 저장했어요.');
        router.push('/admin/blog');
      },
      onError,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 text-ink-900">{post ? '글 수정' : '새 글 쓰기'}</h1>

        <div className="flex items-center gap-3">
          <Toggle
            checked={published}
            onChange={setPublished}
            label={published ? '공개' : '초안'}
          />
          <Button variant="secondary" onClick={() => router.push('/admin/blog')} disabled={saving}>
            취소
          </Button>
          <Button onClick={save} loading={saving}>
            저장
          </Button>
        </div>
      </div>

      {/* 왼쪽 편집 · 오른쪽 미리보기. 좁은 화면에서는 위아래로 쌓인다. */}
      <div className="grid min-h-0 gap-6 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          <Field htmlFor="blog-title" label="제목" required>
            <Input
              id="blog-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="글 제목을 입력하세요"
              maxLength={200}
            />
          </Field>

          <Field
            htmlFor="blog-slug"
            label="주소(slug)"
            hint="영문·숫자·하이픈만 씁니다. 비우면 서버가 자동으로 만듭니다."
          >
            <Input
              id="blog-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="exchange-prep-guide"
              maxLength={200}
            />
          </Field>

          <Field htmlFor="blog-content" label="본문" required>
            <div id="blog-content">
              <RichTextEditor
                initialContent={post?.contentJson ?? null}
                placeholder="내용을 입력하세요. 이미지는 끌어다 놓거나 붙여넣어도 됩니다."
                onChange={({ json, html }) => {
                  setContentJson(json);
                  setContentHtml(html);
                }}
              />
            </div>
          </Field>

          {/* ── 목록 카드 설정 ─────────────────────────── */}
          <section className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-surface p-5">
            <div>
              <h2 className="text-h2 text-ink-900">목록 카드</h2>
              <p className="mt-1 text-caption text-ink-500">
                블로그 목록에 실릴 이미지와 설명입니다. 비우면 본문에서 자동으로 채웁니다.
              </p>
            </div>

            <Field htmlFor="blog-thumbnail" label="카드 이미지">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-md border border-ink-100 bg-canvas">
                    {effectiveThumbnail === '' ? (
                      <div className="flex size-full items-center justify-center text-caption text-ink-300">
                        없음
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element -- 임의 주소가 올 수 있어 next/image를 쓰지 않는다 */
                      <img
                        src={effectiveThumbnail}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      id="blog-thumbnail"
                      size="sm"
                      variant="secondary"
                      disabled={uploading}
                      leftIcon={<ImagePlus aria-hidden className="size-4" />}
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      업로드
                    </Button>
                    {thumbnailUrl !== '' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Trash2 aria-hidden className="size-4" />}
                        onClick={() => setThumbnailUrl('')}
                      >
                        지정 해제
                      </Button>
                    )}
                  </div>
                </div>

                {bodyImages.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-caption text-ink-500">본문 이미지에서 고르기</p>
                    <div className="flex flex-wrap gap-2">
                      {bodyImages.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setThumbnailUrl(url)}
                          aria-label="이 이미지를 카드 이미지로 쓰기"
                          aria-pressed={thumbnailUrl === url}
                          className={cn(
                            'size-16 overflow-hidden rounded-md border-2 transition-colors',
                            thumbnailUrl === url ? 'border-brand-500' : 'border-ink-100 hover:border-ink-300',
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- 위와 같은 이유 */}
                          <img src={url} alt="" className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadThumbnail(file);
                    event.target.value = '';
                  }}
                />
              </div>
            </Field>

            <Field
              htmlFor="blog-summary"
              label="카드 설명"
              hint={`비우면 본문 앞 ${SUMMARY_LENGTH}자로 채웁니다.`}
            >
              <Textarea
                id="blog-summary"
                rows={3}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder={effectiveSummary === '' ? '본문을 쓰면 여기에 자동 요약이 들어갑니다.' : effectiveSummary}
                maxLength={300}
              />
            </Field>
          </section>
        </div>

        {/* 미리보기는 스크롤을 따라다녀야 편집하면서 계속 볼 수 있다 */}
        <div className="min-w-0 xl:sticky xl:top-6 xl:h-[calc(100dvh-3rem)]">
          <BlogPreviewPanel
            title={title}
            summary={effectiveSummary}
            thumbnailUrl={effectiveThumbnail}
            contentHtml={contentHtml}
            authorNickname={post?.authorNickname ?? null}
            publishedAt={published ? (post?.publishedAt ?? new Date().toISOString()) : null}
            likeCount={post?.likeCount ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
