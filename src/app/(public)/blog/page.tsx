import type { Metadata } from 'next';

import { BlogCard } from '@/features/blog/ui/BlogCard';
import { BlogMorePosts } from '@/features/blog/ui/BlogMorePosts';
import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { BlogPostSummaryResponse, CursorPage } from '@/shared/api/types';
import { EmptyState } from '@/shared/ui';
import { Logo } from '@/shared/ui/Logo';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

export const metadata: Metadata = {
  title: '블로그',
  description:
    '교환학생 준비와 현지 생활에 대해 UNIROAD가 쓰는 글. 파견 준비, 거래, 동행에서 실제로 겪은 이야기를 남깁니다.',
  alternates: { canonical: '/blog' },
};

const PAGE_SIZE = 9;

/**
 * 첫 페이지는 서버에서 받아 그대로 그린다.
 * 목록을 클라이언트에서만 채우면 크롤러에는 빈 껍데기만 남아 블로그를 두는 의미가 없다.
 */
export default async function BlogPage() {
  const page = await fetchPublic<CursorPage<BlogPostSummaryResponse>>(
    `${endpoints.blog.list}?size=${PAGE_SIZE}`,
    60,
  );

  const posts = page?.items ?? [];
  const nextCursor = page?.hasNext ? page.nextCursorId : null;

  return (
    <>
      <LandingHeader />

      <main className="break-keep bg-canvas">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:px-8 sm:py-20">
          <header className="flex flex-col gap-3">
            <p className="text-label tracking-[0.16em] text-brand-600 uppercase">Blog</p>
            <h1 className="text-section text-ink-900 text-balance">
              <Logo tone="ink" inline />가 쓰는 글
            </h1>
            <p className="max-w-2xl text-lead text-ink-500">
              교환학생 준비와 현지 생활에서 실제로 마주한 것들을 정리해 남깁니다.
            </p>
          </header>

          <div className="mt-12 sm:mt-14">
            {posts.length === 0 ? (
              <EmptyState title="아직 올라온 글이 없어요" description="첫 글을 준비하고 있어요." />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} href={`/blog/${post.slug}`} />
                  ))}
                </div>

                {nextCursor !== null && <BlogMorePosts initialCursor={nextCursor} size={PAGE_SIZE} />}
              </>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
