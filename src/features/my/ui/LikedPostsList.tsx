'use client';

import { useMyCommunityList } from '@/features/community/api';
import { PostCard } from '@/features/community/ui/PostCard';
import { EmptyState, ErrorState, InfiniteScrollSentinel, Skeleton } from '@/shared/ui';

/** 좋아요 목록은 자유게시판에만 있다 */
export function LikedPostsList() {
  const liked = useMyCommunityList('liked');

  return (
    <div className="flex flex-col gap-6">
      {liked.isPending && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      )}

      {liked.isError && <ErrorState error={liked.error} onRetry={liked.refetch} />}

      {liked.isEmpty && (
        <EmptyState
          title="좋아요한 글이 없어요"
          description="도움이 된 글에 좋아요를 누르면 여기 모여요."
        />
      )}

      {liked.items.length > 0 && (
        <ul className="flex flex-col border-t border-ink-100">
          {liked.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}

      <InfiniteScrollSentinel
        hasNext={liked.hasNext}
        loading={liked.isFetchingNext}
        onLoadMore={liked.fetchNext}
      />
    </div>
  );
}
