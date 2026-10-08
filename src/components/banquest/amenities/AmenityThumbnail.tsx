'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function AmenityThumbnail({
    src,
    alt,
    size = 'sm',
}: {
    src: string;
    alt: string;
    size?: 'sm' | 'lg';
}) {
    const dim = size === 'lg' ? 'h-20 w-20' : 'h-10 w-10';
    return (
        <div
            className={cn(
                'relative shrink-0 overflow-hidden rounded-lg bg-gray-100',
                dim,
            )}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes={size === 'lg' ? '80px' : '40px'}
            />
        </div>
    );
}
