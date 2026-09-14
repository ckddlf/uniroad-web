'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ImagePlus, Trash2 } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import type { BlogContentJson, BlogPostDetailResponse } from '@/shared/api/types';
import { useS3Upload } from '@/shared/hooks/useS3Upload';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/date';
import { readJson, removeKey, writeJson } from '@/shared/lib/storage';
import { Button, Field, Input, TagInput, Textarea, Toggle, useToast } from '@/shared/ui';
import { RichTextEditor } from '@/shared/ui/editor/RichTextEditor';

import { useAdminBlogMutations } from '../api';
import { BlogPreviewPanel } from './BlogPreviewPanel';
import { SerpPreview } from './SerpPreview';

const SUMMARY_LENGTH = 150;
const META_TITLE_LENGTH = 60;
const META_DESCRIPTION_LENGTH = 160;

/**
 * 쓰던 글을 브라우저에 임시로 담아 두는 자리.
 *
 * 글 하나에 한 시간씩 들어가는데 실수로 탭을 닫거나 세션이 끊기면 전부 사라진다.
 * 저장 버튼을 누르기 전까지는 서버에 아무것도 없으므로, 그 사이를 브라우저가 메운다.
 * 수정 화면에서는 쓰지 않는다 — 서버에 있는 원본이 언제나 우선이다.
 */
const DRAFT_KEY = 'uniroad.blogDraft';
const AUTOSAVE_INTERVAL = 15_000;

interface BlogDraft {
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string;
  contentJson: BlogContentJson;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  tags: string[];
  canonicalUrl: string;
  noindex: boolean;
  savedAt: string;
}

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

/** 길이가 한계를 넘으면 빨갛게 바뀐다 — 숫자만 보고는 아무도 고치지 않는다 */
function CharacterCount({
  current,
  limit,
  note,
}: {
  current: number;
  limit: number;
  note: string;
}) {
  return (
    <>
      <span className={cn('font-medium', current > limit ? 'text-danger' : 'text-ink-500')}>
        {current}/{limit}
      </span>{' '}
      {note}
    </>
  );
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
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [summary, setSummary] = useState(post?.summary ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnailUrl ?? '');
  const [contentHtml, setContentHtml] = useState(post?.contentHtml ?? '');
  const [contentJson, setContentJson] = useState<BlogContentJson>(
    post?.contentJson ?? { type: 'doc', content: [] },
  );
  const [published, setPublished] = useState(post?.status === 'PUBLISHED');

  /* 검색 노출 — 작성자가 적은 값만 들고 있는다. 비었을 때 무엇으로 채울지는 아래에서 따로 계산한다. */
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? '');
  const [ogImageUrl, setOgImageUrl] = useState(post?.ogImageUrl ?? '');
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? '');
  const [noindex, setNoindex] = useState(post?.noindex ?? false);

  /* 임시저장 — 새 글에서만 쓴다 */
  const [draft, setDraft] = useState<BlogDraft | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  /** 임시저장을 불러오면 에디터를 새로 그려야 내용이 들어간다 (한 번 채운 뒤에는 덮어쓰지 않으므로) */
  const [editorSeed, setEditorSeed] = useState<BlogContentJson | null>(post?.contentJson ?? null);
  const [editorKey, setEditorKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const submittedRef = useRef(false);

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

  /* 서버의 fallback 순서와 같게 맞춘다: 검색용 값 → 화면용 값 */
  const effectiveMetaTitle = metaTitle.trim() !== '' ? metaTitle.trim() : title.trim();
  const effectiveMetaDescription =
    metaDescription.trim() !== '' ? metaDescription.trim() : effectiveSummary;
  const effectiveOgImage = ogImageUrl !== '' ? ogImageUrl : effectiveThumbnail;

  // 쓰던 글이 남아 있으면 먼저 물어본다 (수정 화면에서는 원본이 우선이라 건너뛴다)
  useEffect(() => {
    if (post) return;
    const saved = readJson<BlogDraft>(DRAFT_KEY);
    if (saved && (saved.title !== '' || saved.contentHtml !== '')) setDraft(saved);
  }, [post]);

  /* 타자 한 번마다 타이머를 다시 걸면 쉬지 않고 쓰는 동안에는 한 번도 저장되지 않는다.
     최신 값만 여기에 담아 두고, 타이머는 처음 한 번만 건다. */
  const latestRef = useRef<Omit<BlogDraft, 'savedAt'>>(null);
  useEffect(() => {
    latestRef.current = {
      title,
      slug,
      summary,
      thumbnailUrl,
      contentJson,
      contentHtml,
      metaTitle,
      metaDescription,
      ogImageUrl,
      tags,
      canonicalUrl,
      noindex,
    };
  });

  // 일정 간격으로 담아 둔다. 값이 바뀔 때마다 쓰면 타이핑 중에 저장소를 계속 두드리게 된다.
  useEffect(() => {
    if (post) return;

    const timer = window.setInterval(() => {
      const latest = latestRef.current;
      if (latest === null || (latest.title === '' && latest.contentHtml === '')) return;

      const now = new Date().toISOString();
      writeJson(DRAFT_KEY, { ...latest, savedAt: now } satisfies BlogDraft);
      setSavedAt(now);
    }, AUTOSAVE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [post]);

  // 저장하지 않은 채 창을 닫으려 하면 브라우저 기본 확인창을 띄운다
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      if (title === '' && contentHtml === '') return;
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [title, contentHtml]);

  /** 담아 둔 내용을 화면에 올린다 */
  const restoreDraft = (saved: BlogDraft) => {
    setTitle(saved.title);
    setSlug(saved.slug);
    setSummary(saved.summary);
    setThumbnailUrl(saved.thumbnailUrl);
    setContentJson(saved.contentJson);
    setContentHtml(saved.contentHtml);
    setMetaTitle(saved.metaTitle);
    setMetaDescription(saved.metaDescription);
    setOgImageUrl(saved.ogImageUrl);
    setTags(saved.tags);
    setCanonicalUrl(saved.canonicalUrl);
    setNoindex(saved.noindex);
    setEditorSeed(saved.contentJson);
    setEditorKey((key) => key + 1);
    setSavedAt(saved.savedAt);
    setDraft(null);
  };

  /** 카드 이미지와 공유 이미지가 같은 절차를 쓴다 — 올린 주소를 받아 넣을 곳만 다르다 */
  const uploadImage = async (file: File, apply: (url: string) => void) => {
    try {
      const [uploaded] = await uploadFiles([file]);
      if (uploaded?.fileUrl) apply(uploaded.fileUrl);
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
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      ogImageUrl: ogImageUrl.trim(),
      tags,
      canonicalUrl: canonicalUrl.trim(),
      noindex,
      published,
    };

    const onError = (error: unknown) => toast.error(toErrorMessage(error));

    if (post) {
      update.mutate(
        { postId: post.id, ...body },
        {
          onSuccess: () => {
            submittedRef.current = true;
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
        submittedRef.current = true;
        // 서버에 올라갔으니 브라우저에 담아 둔 것은 지운다 — 다음에 또 물어보면 혼란스럽다
        removeKey(DRAFT_KEY);
        toast.success(published ? '글을 공개했어요.' : '초안으로 저장했어요.');
        router.push('/admin/blog');
      },
      onError,
    });
  };

  return (
    /* 글 쓰는 동안에는 화면 전체를 쓴다. 관리자 사이드바와 페이지 여백까지 본문에 내주고,
       나가는 길은 위쪽 [취소]·[저장]이 맡는다. */
    <div className="fixed inset-0 z-40 flex flex-col bg-canvas">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-surface px-4 py-3 sm:px-6">
        <h1 className="text-h1 text-ink-900">{post ? '글 수정' : '새 글 쓰기'}</h1>

        <div className="flex items-center gap-3">
          <Toggle
            checked={published}
            onChange={setPublished}
            label={published ? '공개' : '초안'}
          />
          <Button
            variant="secondary"
            leftIcon={<Eye aria-hidden className="size-4" />}
            onClick={() => setPreviewOpen(true)}
          >
            미리보기
          </Button>
          <Button variant="secondary" onClick={() => router.push('/admin/blog')} disabled={saving}>
            취소
          </Button>
          <Button onClick={save} loading={saving}>
            저장
          </Button>
        </div>
      </header>

      {/* 스크롤은 여기서만 — 위쪽 막대는 자리를 지킨다 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 scrollbar-thin sm:px-6">
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-col gap-5">
          {draft && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink-300 bg-canvas px-4 py-3">
              <p className="text-body text-ink-700">
                쓰다 만 글이 있어요.{' '}
                <span className="text-ink-500">
                  {formatDate(draft.savedAt, 'M월 d일 HH:mm')}에 담아 둔 내용입니다.
                </span>
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => restoreDraft(draft)}>
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

          {/* 미리보기를 옆에 붙여 두지 않는다 — 쓰는 칸이 좁아지고, 좁은 칸의 줄바꿈은 실제와 다르다.
              볼 때만 [미리보기]로 화면 전체를 쓴다. */}
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
                key={editorKey}
                initialContent={editorSeed}
                /* 위쪽 막대와 제목·주소 칸이 차지하는 만큼만 빼고 화면을 다 쓴다 */
                className="h-[calc(100dvh-18rem)] min-h-[20rem]"
                placeholder="내용을 입력하세요. 이미지는 끌어다 놓거나 붙여넣어도 됩니다."
                statusNote={
                  savedAt === null ? undefined : (
                    <span>임시저장 {formatDate(savedAt, 'HH:mm')}</span>
                  )
                }
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
                    if (file) void uploadImage(file, setThumbnailUrl);
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

          {/* ── 검색 노출 ──────────────────────────────── */}
          <section className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-surface p-5">
            <div>
              <h2 className="text-h2 text-ink-900">검색 노출</h2>
              <p className="mt-1 text-caption text-ink-500">
                검색결과와 공유 미리보기에 쓰는 값입니다. 비우면 위의 제목·카드 설명을 그대로 씁니다.
              </p>
            </div>

            <SerpPreview
              title={effectiveMetaTitle}
              description={effectiveMetaDescription}
              slug={slug.trim()}
            />

            <Field
              htmlFor="blog-meta-title"
              label="검색 제목"
              hint={
                <CharacterCount
                  current={effectiveMetaTitle.length + ' | UNIROAD'.length}
                  limit={META_TITLE_LENGTH}
                  note="넘으면 검색결과에서 뒤가 잘립니다."
                />
              }
            >
              <Input
                id="blog-meta-title"
                value={metaTitle}
                onChange={(event) => setMetaTitle(event.target.value)}
                placeholder={title.trim() === '' ? '제목을 쓰면 그대로 쓰입니다.' : title.trim()}
                maxLength={META_TITLE_LENGTH}
              />
            </Field>

            <Field
              htmlFor="blog-meta-description"
              label="검색 설명"
              hint={
                <CharacterCount
                  current={effectiveMetaDescription.length}
                  limit={META_DESCRIPTION_LENGTH}
                  note="검색결과에서 클릭을 결정하는 두 줄입니다. 본문 도입부가 그대로 쓰이면 글의 주제가 드러나지 않으니 직접 쓰는 편이 좋습니다."
                />
              }
            >
              <Textarea
                id="blog-meta-description"
                rows={3}
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                placeholder={
                  effectiveSummary === '' ? '비우면 카드 설명을 그대로 씁니다.' : effectiveSummary
                }
                maxLength={META_DESCRIPTION_LENGTH}
              />
            </Field>

            <Field htmlFor="blog-og-image" label="공유 이미지">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-[63px] w-[120px] shrink-0 overflow-hidden rounded-md border border-ink-100 bg-canvas">
                    {effectiveOgImage === '' ? (
                      <div className="flex size-full items-center justify-center text-caption text-ink-300">
                        없음
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element -- 임의 주소가 올 수 있어 next/image를 쓰지 않는다 */
                      <img src={effectiveOgImage} alt="" className="size-full object-cover" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      id="blog-og-image"
                      size="sm"
                      variant="secondary"
                      disabled={uploading}
                      leftIcon={<ImagePlus aria-hidden className="size-4" />}
                      onClick={() => ogImageInputRef.current?.click()}
                    >
                      업로드
                    </Button>
                    {ogImageUrl !== '' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Trash2 aria-hidden className="size-4" />}
                        onClick={() => setOgImageUrl('')}
                      >
                        지정 해제
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-caption text-ink-500">
                  1200×630이 아니면 카카오톡·X에서 위아래가 잘립니다. 비우면 카드 이미지를 씁니다.
                </p>

                <input
                  ref={ogImageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadImage(file, setOgImageUrl);
                    event.target.value = '';
                  }}
                />
              </div>
            </Field>

            <Field htmlFor="blog-tags" label="태그" hint="2~5개가 적당합니다. 소문자로 저장됩니다.">
              <TagInput id="blog-tags" value={tags} onChange={setTags} />
            </Field>

            {/* 평소에는 쓸 일이 없고, 잘못 건드리면 글이 검색에서 사라진다 */}
            <details className="group rounded-md border border-ink-100 bg-canvas px-4 py-3">
              <summary className="cursor-pointer list-none text-label font-medium text-ink-700">
                고급 설정
              </summary>

              <div className="mt-4 flex flex-col gap-4">
                <Field
                  htmlFor="blog-canonical"
                  label="원본 주소(canonical)"
                  hint="같은 글을 외부 매체에 먼저 실었을 때만 채웁니다. 비우면 이 글이 원본입니다."
                >
                  <Input
                    id="blog-canonical"
                    value={canonicalUrl}
                    onChange={(event) => setCanonicalUrl(event.target.value)}
                    placeholder="https://example.com/original-post"
                    maxLength={500}
                  />
                </Field>

                <Field
                  htmlFor="blog-noindex"
                  label="검색에서 제외"
                  hint="켜면 이 글은 검색결과에 뜨지 않고 sitemap에서도 빠집니다."
                >
                  <div id="blog-noindex">
                    <Toggle
                      checked={noindex}
                      onChange={setNoindex}
                      label={noindex ? '색인 제외' : '색인 허용'}
                    />
                  </div>
                </Field>
              </div>
            </details>
          </section>
        </div>
      </div>

      {previewOpen && (
        <BlogPreviewPanel
          onClose={() => setPreviewOpen(false)}
          title={title}
          summary={effectiveSummary}
          thumbnailUrl={effectiveThumbnail}
          contentHtml={contentHtml}
          publishedAt={published ? (post?.publishedAt ?? new Date().toISOString()) : null}
          likeCount={post?.likeCount ?? 0}
        />
      )}
    </div>
  );
}
