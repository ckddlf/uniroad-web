import Image from 'next/image';

import { cn } from '@/shared/lib/cn';
import { initial } from '@/shared/lib/format';

export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE: Record<AvatarSize, string> = {
  sm: 'size-6 text-caption',
  md: 'size-9 text-body',
  lg: 'size-14 text-h2',
};

const PIXELS: Record<AvatarSize, number> = { sm: 24, md: 36, lg: 56 };

export interface AvatarProps {
  name: string | null | undefined;
  /** 프로필 이미지 API가 없어 대부분 이니셜로 표시된다 */
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const label = name?.trim() || '알 수 없는 사용자';

  if (src) {
    return (
      <Image
        src={src}
        alt={`${label} 프로필 사진`}
        width={PIXELS[size]}
        height={PIXELS[size]}
        className={cn('rounded-full object-cover', SIZE[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700',
        SIZE[size],
        className,
      )}
    >
      {initial(label)}
    </span>
  );
}
