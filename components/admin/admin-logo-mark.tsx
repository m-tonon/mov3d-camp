'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const BOX: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-7 rounded-lg',
  md: 'size-8 rounded-lg',
  lg: 'size-12 rounded-2xl',
};

const PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: 28,
  md: 32,
  lg: 48,
};

type Props = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function AdminLogoMark({ size = 'md', className }: Props) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden p-0.5',
        BOX[size],
        className,
      )}
      aria-hidden
    >
      <Image
        src="/icon-dark.png"
        alt=""
        width={PX[size]}
        height={PX[size]}
        className="size-full rounded-[inherit] object-cover"
        unoptimized
      />
    </div>
  );
}
