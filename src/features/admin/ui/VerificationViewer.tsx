'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Maximize2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

import { useVerificationImageUrl } from '@/features/verification/api';
import { Button, Modal, Skeleton } from '@/shared/ui';

/** 심사용 이미지 뷰어 — 확대·회전·전체화면 */
export function VerificationViewer({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const { url, isPending, isError } = useVerificationImageUrl(imageUrl);

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // 다른 제출 건으로 넘어가면 확대·회전을 초기화한다
  useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [imageUrl]);

  if (isPending) return <Skeleton className="h-[28rem] w-full" />;

  if (isError || !url) {
    return (
      <div className="flex h-[28rem] items-center justify-center rounded-lg border border-ink-100 bg-canvas text-center text-body text-ink-500">
        제출 이미지를 불러오지 못했어요.
        <br />
        S3 조회 URL 발급에 실패했습니다.
      </div>
    );
  }

  const controls = (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setScale((value) => Math.min(4, value + 0.25))}
        leftIcon={<ZoomIn aria-hidden className="size-4" />}
      >
        확대
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setScale((value) => Math.max(0.5, value - 0.25))}
        leftIcon={<ZoomOut aria-hidden className="size-4" />}
      >
        축소
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setRotation((value) => (value + 90) % 360)}
        leftIcon={<RotateCw aria-hidden className="size-4" />}
      >
        회전
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setFullscreen(true)}
        leftIcon={<Maximize2 aria-hidden className="size-4" />}
      >
        전체화면
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {controls}

      <div className="relative h-[28rem] overflow-auto rounded-lg border border-ink-100 bg-ink-900/5">
        <div className="flex min-h-full items-center justify-center p-4">
          <Image
            src={url}
            alt={alt}
            width={900}
            height={1200}
            unoptimized
            className="h-auto max-w-none origin-center transition-transform"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              width: `${Math.round(scale * 100)}%`,
              maxWidth: '100%',
            }}
          />
        </div>
      </div>

      <Modal open={fullscreen} onClose={() => setFullscreen(false)} size="lg" title={alt}>
        <div className="relative flex max-h-[70vh] justify-center overflow-auto">
          <Image
            src={url}
            alt={alt}
            width={1400}
            height={1800}
            unoptimized
            className="h-auto w-full object-contain"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>
      </Modal>
    </div>
  );
}
