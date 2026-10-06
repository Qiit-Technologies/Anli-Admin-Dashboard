'use client';

import { MenuCategory } from '@/components/banquest/menu/types';
import { cn } from '@/lib/utils';
import { UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';

const THUMB_STYLES: Record<
    MenuCategory,
    { bg: string; icon: string; image?: string }
> = {
    wedding: {
        bg: 'bg-gradient-to-br from-orange-200 to-amber-100',
        icon: 'text-orange-700',
        image: 'https://images.unsplash.com/photo-1467003909583-2f8a72700288?w=120&h=120&fit=crop',
    },
    corporate: {
        bg: 'bg-gradient-to-br from-sky-200 to-blue-100',
        icon: 'text-sky-700',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=120&h=120&fit=crop',
    },
    social: {
        bg: 'bg-gradient-to-br from-pink-200 to-rose-100',
        icon: 'text-pink-700',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=120&h=120&fit=crop',
    },
    local: {
        bg: 'bg-gradient-to-br from-violet-200 to-purple-100',
        icon: 'text-violet-700',
    },
    other: {
        bg: 'bg-gradient-to-br from-gray-200 to-gray-100',
        icon: 'text-gray-600',
    },
};

export default function MenuPackageThumbnail({
    category,
    imageUrl,
    size = 'md',
    className,
}: {
    category: MenuCategory;
    imageUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const style = THUMB_STYLES[category] ?? THUMB_STYLES.other;
    const src = imageUrl || style.image;
    const sizeClass =
        size === 'lg'
            ? 'h-28 w-28 rounded-xl'
            : size === 'sm'
              ? 'h-12 w-12 rounded-lg'
              : 'h-14 w-14 rounded-lg';

    return (
        <div
            className={cn(
                'relative shrink-0 overflow-hidden',
                sizeClass,
                !src && style.bg,
                className,
            )}
        >
            {src ? (
                <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                />
            ) : (
                <span
                    className={cn(
                        'flex h-full w-full items-center justify-center',
                        style.icon,
                    )}
                >
                    <UtensilsCrossed
                        className={size === 'lg' ? 'h-10 w-10' : 'h-5 w-5'}
                    />
                </span>
            )}
        </div>
    );
}
