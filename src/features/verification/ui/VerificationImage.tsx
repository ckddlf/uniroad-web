'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui';

import { requestVerificationReadUrl } from '../api';

export interface VerificationImageProps {
  /**
   * 제출 때 저장한 값. 인증 서류는 비공개 경로라 보통 S3 key가 들어 있고,
   * 예전 데이터처럼 전체 URL이 들어 있으면 그대로 사용한다.
   */
  imageUrl: string;
  alt: string;
  className?: string;
}

export function VerificationImage({ imageUrl, alt, className }: VerificationImageProps) {
  const isDirectUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
  const isPdf = imageUrl.toLowerCase().endsWith('.pdf');
  const [failed, setFailed] = useState(false);

  const readUrl = useQuery({
    queryKey: ['verification', 'readUrl', imageUrl],
    queryFn: () => requestVerificationReadUrl(imageUrl),
    enabled: !isDirectUrl,
    // 발급된 URL은 10분 뒤 만료된다
    staleTime: 8 * 60 * 1000,
    retry: false,
  });

  const source = isDirectUrl ? imageUrl : readUrl.data?.downloadUrl;

  if (!isDirectUrl && readUrl.isPending) {
    return <Skeleton className={cn('aspect-[3/4] w-full', className)} />;
  }

  if (!source || failed || readUrl.isError) {
    return (
      <div
        className={cn(
          'flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-md border border-ink-100 bg-canvas text-center',
          className,
        )}
      >
        <FileText aria-hidden className="size-6 text-ink-300" />
        <p className="px-4 text-caption text-ink-500">
          {isPdf ? 'PDF 파일은 미리보기를 제공하지 않아요.' : '제출한 파일을 불러오지 못했어요.'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-[3/4] w-full overflow-hidden rounded-md border border-ink-100', className)}>
      <Image
        src={source}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 320px"
        className="object-contain"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
