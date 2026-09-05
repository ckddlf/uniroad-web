import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { BlogArticle } from '@/features/blog/ui/BlogArticle';
import { BlogLikeButton } from '@/features/blog/ui/BlogLikeButton';
import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { BlogPostDetailResponse } from '@/shared/api/types';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** 목록·상세 모두 공개 엔드포인트라 서버에서 받아 정적으로 내보낸다 */
async function loadPost(slug: string): Promise<BlogPostDetailResponse | null> {
  return fetchPublic<BlogPostDetailResponse>(endpoints.blog.detail(slug), 60);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (post === null) {
    return { title: '글을 찾을 수 없어요' };
  }

  const description = post.summary ?? undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      images: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (post === null) notFound();

  return (
    <>
      <LandingHeader />

      <main className="bg-surface">
        <div className="mx-auto w-full max-w-[760px] px-6 py-14 sm:px-8 sm:py-20">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-caption text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft aria-hidden className="size-4" />
            블로그 목록
          </Link>

          <BlogArticle
            post={post}
            actions={
              <BlogLikeButton
                postId={post.id}
                slug={post.slug}
                initialLiked={post.likedByMe}
                initialCount={post.likeCount}
              />
            }
          />
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
