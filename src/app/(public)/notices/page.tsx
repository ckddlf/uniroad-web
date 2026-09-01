import type { Metadata } from 'next';

import { NoticeList } from '@/features/notice/ui/NoticeList';
import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { NoticeResponse } from '@/shared/api/types';
import { LandingFooter } from '@/widgets/landing/LandingFooter';
import { LandingHeader } from '@/widgets/landing/LandingHeader';

export const metadata: Metadata = {
  title: '공지사항',
  description: 'UNIROAD 운영 공지와 업데이트 소식입니다.',
};

export default async function NoticesPage() {
  // TODO(api): 목록에 페이징이 없어 전체 배열이 온다. 화면에서 20개씩 나눠 보여준다.
  const notices = await fetchPublic<NoticeResponse[]>(endpoints.notice.list, 60);

  return (
    <>
      <LandingHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-h1 text-ink-900">공지사항</h1>

        {!Array.isArray(notices) ? (
          <p className="mt-8 text-body text-ink-500">
            공지를 불러오지 못했어요. 잠시 후 다시 열어주세요.
          </p>
        ) : (
          <NoticeList notices={notices} />
        )}
      </main>

      <LandingFooter />
    </>
  );
}
