import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { BlogArticle } from '@/features/blog/ui/BlogArticle';
import { BlogLikeButton } from '@/features/blog/ui/BlogLikeButton';
import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { BlogPostDetailResponse } from '@/shared/api/types';
import { articleSchema, breadcrumbSchema } from '@/shared/lib/jsonLd';
import { JsonLd } from '@/shared/ui';
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
    // 없는 글이 검색에 남지 않도록 색인에서 뺀다
    return { title: '글을 찾을 수 없어요', robots: { index: false, follow: false } };
  }

  // effective*는 작성자가 SEO 값을 비웠을 때 서버가 화면용 값으로 채워 내려준 결과다
  const title = post.effectiveMetaTitle ?? post.title;
  const description = post.effectiveMetaDescription ?? undefined;
  const image = post.effectiveOgImageUrl ?? undefined;

  return {
    title,
    description,
    keywords: post.tags.length > 0 ? post.tags : undefined,
    // 같은 글을 외부에 먼저 실었다면 그쪽이 원본이다
    alternates: { canonical: post.canonicalUrl ?? `/blog/${post.slug}` },
    // 색인에서 빼더라도 링크는 따라가게 둔다 — 이 글에서 거는 내부 링크는 살려야 한다
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (post === null) notFound();

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: post.effectiveMetaTitle ?? post.title,
          description: post.effectiveMetaDescription ?? '',
          slug: post.slug,
          imageUrl: post.effectiveOgImageUrl,
          authorName: post.authorNickname,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          tags: post.tags,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: '홈', path: '/' },
          { name: '블로그', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
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
