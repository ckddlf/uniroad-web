import Image from 'next/image';

import { cn } from '@/shared/lib/cn';

/**
 * 워드마크 원본 픽셀. 잉크가 캔버스를 여백 없이 꽉 채우고 있어(측정값 684×140)
 * 이 비율이 곧 화면에 보이는 비율이고, 높이만 정하면 폭은 따라온다.
 */
const SIZE = { width: 684, height: 140 } as const;

const SRC = {
  /** 상단바처럼 로고가 홀로 서는 자리 */
  brand: '/logo-uniroad.png',
  /** 본문 글자 사이에 섞이는 자리. 주변 글자색(ink-900)과 같은 검정 */
  ink: '/logo-uniroad-ink.png',
} as const;

export interface LogoProps {
  tone?: keyof typeof SRC;
  /**
   * 제목이나 문장 안에 글자처럼 섞이는 자리.
   * 높이를 글자 크기에 매달아 반응형으로 글자가 줄면 로고도 같이 줄고, 기준선을 맞춘다.
   * 0.78em은 워드마크의 어센더 높이가 옆 한글 글자 높이와 나란히 보이는 값이다.
   */
  inline?: boolean;
  /** 높이만 준다. 폭은 원본 비율대로 따라온다 */
  className?: string;
  priority?: boolean;
}

export function Logo({ tone = 'brand', inline, className, priority }: LogoProps) {
  return (
    <Image
      src={SRC[tone]}
      alt="UNIROAD"
      width={SIZE.width}
      height={SIZE.height}
      priority={priority}
      className={cn('w-auto', inline && 'inline-block h-[0.78em] align-baseline', className)}
    />
  );
}
